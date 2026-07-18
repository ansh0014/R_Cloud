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

	"github.com/r-cloud/validation-service/config"
	"github.com/r-cloud/validation-service/internal"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("config error: %s", err)
	}

	router := internal.NewRouter()
	server := internal.NewServer(cfg.Port, cfg.ServerWriteTimeout, cfg.ServerReadTimeout, router)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		fmt.Printf("validation-service starting on :%s\n", cfg.Port)
		if err := server.Start(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %s", err)
		}
	}()

	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("shutdown error: %s", err)
	}

	fmt.Println("validation-service stopped")
}
