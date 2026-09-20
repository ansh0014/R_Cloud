package main

import (
	"database/sql"
	_ "embed"

	"fmt"
	"log"
	"net/http"

	"auth/config"
	"auth/handler"
	"auth/models"
	"auth/routes"
	"auth/session"

	_ "github.com/lib/pq"
)

var migrationsSQL string

func main() {

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	log.Println("Configuration loaded successfully")

	db, err := sql.Open("postgres", cfg.GetDatabaseDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Database connection established")

	log.Println("Running database migrations...")
	if _, err := db.Exec(migrationsSQL); err != nil {
		log.Fatalf("Failed to run database migrations: %v", err)
	}
	log.Println("Database migrations completed successfully")

	userRepo := models.NewUserRepository(db)
	sessionStore, err := session.NewStore(cfg.Upstash, cfg.Session.TTLSeconds)
	if err != nil {
		log.Fatalf("Failed to initialize Upstash session store: %v", err)
	}

	authHandler, err := handler.NewAuthHandler(userRepo, cfg, sessionStore)
	if err != nil {
		log.Fatalf("Failed to initialize Google authentication: %v", err)
	}

	router := routes.SetupRoutes(authHandler)
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on http://localhost%s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
