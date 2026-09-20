package nats

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/nats-io/nats.go"
)

type NATSClient struct {
	Conn *nats.Conn
}

func Connect(url string) (*NATSClient, error) {
	nc, err := nats.Connect(url, nats.Name("r-cloud-microservice"))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS at %s: %w", url, err)
	}

	log.Printf("Successfully connected to NATS at %s", url)
	return &NATSClient{Conn: nc}, nil
}

func (n *NATSClient) Publish(subject string, payload interface{}) error {
	if n == nil || n.Conn == nil {
		return fmt.Errorf("NATS client connection is nil")
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal NATS payload: %w", err)
	}

	if err := n.Conn.Publish(subject, data); err != nil {
		return fmt.Errorf("failed to publish NATS message to subject %s: %w", subject, err)
	}

	return n.Conn.Flush()
}

func (n *NATSClient) Subscribe(subject string, handler func(msg *nats.Msg)) (*nats.Subscription, error) {
	if n == nil || n.Conn == nil {
		return nil, fmt.Errorf("NATS client connection is nil")
	}

	sub, err := n.Conn.Subscribe(subject, handler)
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to NATS subject %s: %w", subject, err)
	}

	log.Printf("Subscribed to NATS subject: %s", subject)
	return sub, nil
}

func (n *NATSClient) Close() {
	if n != nil && n.Conn != nil {
		n.Conn.Close()
		log.Println("NATS connection closed")
	}
}
