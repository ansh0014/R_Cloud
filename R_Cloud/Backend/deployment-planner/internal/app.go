
package internal

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/r-cloud/deployment-planner/handlers"
	"github.com/r-cloud/deployment-planner/planner"
)

func NewRouter() *mux.Router {
	svc := planner.NewPlannerService()
	handler := handlers.NewPlanHandler(svc)

	router := mux.NewRouter()
	router.HandleFunc("/plan", handler.CreatePlan).Methods(http.MethodPost)

	return router
}
