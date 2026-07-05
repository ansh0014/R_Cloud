package internal

import (
	"context"
	"log"
	"net/http"
	"time"
)


type Server struct {
	httpServer *http.Server
}


func NewServer(port string, handler http.Handler, writeTimeout, readTimeout time.Duration) *Server {
	return &Server{
		httpServer: &http.Server{
			Addr:         ":" + port,
			Handler:      handler,
			WriteTimeout: writeTimeout,
			ReadTimeout:  readTimeout,
		},
	}
}

func (s *Server) Start() error {
	log.Printf("project-service listening on %s", s.httpServer.Addr)
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	log.Println("project-service shutting down")
	return s.httpServer.Shutdown(ctx)
}
