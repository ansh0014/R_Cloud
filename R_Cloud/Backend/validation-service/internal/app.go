package internal

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/validation-service/service"
)

func NewRouter() *mux.Router {
	svc := service.NewValidationService()
	handler := NewValidationHandler(svc)

	router := mux.NewRouter()
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","service":"validation-service"}`))
	}).Methods(http.MethodGet)
	router.HandleFunc("/validate", handler.Validate).Methods(http.MethodPost)

	return router
}
