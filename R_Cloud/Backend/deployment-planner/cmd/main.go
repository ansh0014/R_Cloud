package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/r-cloud/deployment-planner/config"
	"github.com/r-cloud/deployment-planner/internal"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	router := internal.NewRouter()
	server := internal.NewServer(cfg.Port, cfg.ServerWriteTimeout, cfg.ServerReadTimeout, router)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		fmt.Printf("deployment-planner service running on :%s\n", cfg.Port)
		if err := server.Start(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failure: %v", err)
		}
	}()

	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown failed: %v", err)
	}

	fmt.Println("deployment-planner stopped gracefully")
}

