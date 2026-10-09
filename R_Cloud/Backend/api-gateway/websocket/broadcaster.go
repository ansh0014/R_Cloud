package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	gorillaws "github.com/gorilla/websocket"
	natspkg "github.com/nats-io/nats.go"
	natsclient "github.com/r-cloud/infrastructure/nats"
	"github.com/r-cloud/shared/events"
)

var upgrader = gorillaws.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Hub manages all active WebSocket connections and broadcasts NATS events to them.
type Hub struct {
	clients   map[*gorillaws.Conn]bool
	broadcast chan []byte
	mu        sync.Mutex
	nats      *natsclient.NATSClient
}

// NewHub creates and starts the WebSocket hub. It uses the centralized
// infrastructure/nats.NATSClient — no direct nats.Connect() call here.
func NewHub(natsURL string) (*Hub, error) {
	nc, err := natsclient.Connect(natsURL)
	if err != nil {
		log.Printf("Warning: NATS connection failed in API Gateway (%v). WebSocket will run in offline mode.", err)
	}

	h := &Hub{
		clients:   make(map[*gorillaws.Conn]bool),
		broadcast: make(chan []byte),
		nats:      nc,
	}

	if nc != nil {
		h.subscribeToNATS()
	}

	go h.run()
	return h, nil
}

// HandleWS upgrades an HTTP connection to WebSocket and registers it with the hub.
func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()

	log.Printf("New WebSocket client connected (%s)", conn.RemoteAddr())

	defer func() {
		h.mu.Lock()
		delete(h.clients, conn)
		h.mu.Unlock()
		conn.Close()
		log.Printf("WebSocket client disconnected (%s)", conn.RemoteAddr())
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

// BroadcastEvent pushes an event message to all connected WebSocket clients.
func (h *Hub) BroadcastEvent(eventType string, payload interface{}) {
	data, err := json.Marshal(map[string]interface{}{
		"type":      eventType,
		"event":     eventType,
		"payload":   payload,
		"data":      payload,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
	if err != nil {
		return
	}
	h.broadcast <- data
}

func (h *Hub) run() {
	for message := range h.broadcast {
		h.mu.Lock()
		for client := range h.clients {
			if err := client.WriteMessage(gorillaws.TextMessage, message); err != nil {
				client.Close()
				delete(h.clients, client)
			}
		}
		h.mu.Unlock()
	}
}

// subscribeToNATS uses infrastructure/nats.NATSClient.Subscribe to listen on all
// deployment and runtime event subjects, then forwards them to WebSocket clients.
func (h *Hub) subscribeToNATS() {
	subjects := []string{
		events.SubjectDeploymentCreated,
		events.SubjectDeploymentValidated,
		events.SubjectDeploymentPlanned,
		events.SubjectDeploymentCompleted,
		events.SubjectDeploymentFailed,
		events.SubjectRuntimeStarted,
		events.SubjectRuntimeStopped,
		events.SubjectRuntimeRestarted,
		events.SubjectRuntimeFailed,
		events.SubjectHealthFailed,
	}

	for _, subj := range subjects {
		subject := subj
		_, err := h.nats.Subscribe(subject, func(msg *natspkg.Msg) {
			var raw json.RawMessage
			_ = json.Unmarshal(msg.Data, &raw)
			h.BroadcastEvent(subject, raw)
		})
		if err != nil {
			log.Printf("Failed to subscribe to NATS subject %s: %v", subject, err)
		}
	}
	log.Println("API Gateway WebSocket Hub subscribed to all NATS subjects via infrastructure/nats")
}

// Close gracefully shuts down the NATS connection via the infrastructure client.
func (h *Hub) Close() {
	if h.nats != nil {
		h.nats.Close()
	}
}
