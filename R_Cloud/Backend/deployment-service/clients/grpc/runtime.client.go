package grpc

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type ServicePlan struct {
	Name          string
	Entrypoint    string
	ExecuteRoute  string
	HealthRoute   string
	MetadataRoute string
}

type DeploymentPlan struct {
	Provider     string
	Mode         string
	Runtime      string
	Framework    string
	BuildCommand string
	StartCommand string
	Environment  map[string]string
	Services     []ServicePlan
}

type CreateRuntimeRequest struct {
	DeploymentID string
	Plan         *DeploymentPlan
}

type CreateRuntimeResponse struct {
	RuntimeID string
	Status    string
}

type RuntimeClient struct {
	conn    *grpc.ClientConn
	timeout time.Duration
}

func NewRuntimeClient(addr string, timeout time.Duration) (*RuntimeClient, error) {
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to runtime service at %s: %w", addr, err)
	}

	return &RuntimeClient{
		conn:    conn,
		timeout: timeout,
	}, nil
}

func (c *RuntimeClient) CreateRuntime(ctx context.Context, req CreateRuntimeRequest) (*CreateRuntimeResponse, error) {
	callCtx, cancel := context.WithTimeout(ctx, c.timeout)
	defer cancel()

	_ = callCtx

	return &CreateRuntimeResponse{
		RuntimeID: "pending",
		Status:    "STARTING",
	}, nil
}

func (c *RuntimeClient) Close() error {
	if err := c.conn.Close(); err != nil {
		return fmt.Errorf("failed to close runtime client connection: %w", err)
	}

	return nil
}
