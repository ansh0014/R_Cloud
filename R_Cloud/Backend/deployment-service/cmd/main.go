package main

import (
	"context"
	"errors"

	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/r-cloud/deployment-service/config"
	"github.com/r-cloud/deployment-service/internal"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load configuration: %v", err)
	}

	app, err := internal.NewApp(cfg)
	if err != nil {
		log.Fatalf("failed to initialize application: %v", err)
	}
	defer func() {
		if err := app.Close(); err != nil {
			log.Printf("error closing resources: %v", err)
		}
	}()

	srv := internal.NewServer(cfg.Port, app.Router, cfg.ServerWriteTimeout, cfg.ServerReadTimeout)

	errChan := make(chan error, 1)
	go func() {
		log.Printf("Starting deployment service on port %s...", cfg.Port)
		if err := srv.Start(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errChan <- err
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-errChan:
		log.Fatalf("server error occurred: %v", err)
	case sig := <-sigChan:
		log.Printf("received signal %v, shutting down...", sig)
	}

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown failed: %v", err)
	}

	log.Println("Deployment service stopped gracefully")
}
