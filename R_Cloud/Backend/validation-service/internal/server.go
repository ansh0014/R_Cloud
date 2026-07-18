package internal

import (
	"context"
	"fmt"
	"net/http"
	"time"
)

type Server struct {
	http *http.Server
}

func NewServer(port string, writeTimeout, readTimeout time.Duration, router http.Handler) *Server {
	return &Server{
		http: &http.Server{
			Addr:         fmt.Sprintf(":%s", port),
			Handler:      router,
			WriteTimeout: writeTimeout,
			ReadTimeout:  readTimeout,
		},
	}
}

func (s *Server) Start() error {
	return s.http.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.http.Shutdown(ctx)
}
