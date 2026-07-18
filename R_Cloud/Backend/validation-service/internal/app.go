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
	router.HandleFunc("/validate", handler.Validate).Methods(http.MethodPost)

	return router
}
