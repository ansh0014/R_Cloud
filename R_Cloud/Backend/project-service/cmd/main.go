package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/r-cloud/project-service/config"
	"github.com/r-cloud/project-service/internal"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("configuration error: %v", err)
	}

	app, err := internal.NewApp(cfg)
	if err != nil {
		log.Fatalf("failed to initialise app: %v", err)
	}
	defer app.DB.Close()

	srv := internal.NewServer(
		cfg.Port,
		app.Router,
		cfg.ServerWriteTimeout,
		cfg.ServerReadTimeout,
	)


	go func() {
		if err := srv.Start(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown failed: %v", err)
	}

	log.Println("project-service stopped")
}
