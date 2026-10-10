package repo

import "testing"

func TestDeploymentRepository_UpdateMode_ReturnsErrorWhenDatabaseUnavailable(t *testing.T) {
	repo := &DeploymentRepository{}

	err := repo.UpdateMode("deployment-123", "microservices")
	if err == nil {
		t.Fatal("expected UpdateMode to fail when database is not configured")
	}
}
