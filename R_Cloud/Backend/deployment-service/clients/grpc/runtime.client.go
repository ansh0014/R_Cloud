package grpc

import (
	"context"
	"fmt"
	"log"
	"time"

	pb "github.com/r-cloud/shared/proto/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type ServicePlan struct {
	Name          string `json:"name"`
	Entrypoint    string `json:"entrypoint"`
	ExecuteRoute  string `json:"executeRoute"`
	HealthRoute   string `json:"healthRoute"`
	MetadataRoute string `json:"metadataRoute"`
}

type DeploymentPlan struct {
	Provider     string            `json:"provider"`
	Mode         string            `json:"mode"`
	Runtime      string            `json:"runtime"`
	Framework    string            `json:"framework"`
	BuildCommand string            `json:"buildCommand"`
	StartCommand string            `json:"startCommand"`
	Environment  map[string]string `json:"environment"`
	Services     []ServicePlan     `json:"services"`
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

	client := pb.NewRuntimeServiceClient(c.conn)

	var protoServices []*pb.ServicePlan
	provider := "railway"
	mode := "monolith"
	runtime := "python"
	framework := "fastapi"
	buildCommand := ""
	startCommand := ""
	var env map[string]string

	if req.Plan != nil {
		if req.Plan.Provider != "" {
			provider = req.Plan.Provider
		}
		if req.Plan.Mode != "" {
			mode = req.Plan.Mode
		}
		if req.Plan.Runtime != "" {
			runtime = req.Plan.Runtime
		}
		if req.Plan.Framework != "" {
			framework = req.Plan.Framework
		}
		buildCommand = req.Plan.BuildCommand
		startCommand = req.Plan.StartCommand
		env = req.Plan.Environment

		for _, s := range req.Plan.Services {
			protoServices = append(protoServices, &pb.ServicePlan{
				Name:          s.Name,
				Entrypoint:    s.Entrypoint,
				ExecuteRoute:  s.ExecuteRoute,
				HealthRoute:   s.HealthRoute,
				MetadataRoute: s.MetadataRoute,
			})
		}
	}

	protoReq := &pb.CreateRuntimeRequest{
		DeploymentId: req.DeploymentID,
		Provider:     provider,
		Mode:         mode,
		Runtime:      runtime,
		Framework:    framework,
		BuildCommand: buildCommand,
		StartCommand: startCommand,
		Environment:  env,
		Services:     protoServices,
	}

	log.Printf("[RuntimeClient] Invoking CreateRuntime gRPC: DeploymentID=%s, Provider=%s, Mode=%s, Services=%d",
		req.DeploymentID, provider, mode, len(protoServices))

	res, err := client.CreateRuntime(callCtx, protoReq)
	if err != nil {
		log.Printf("[RuntimeClient] CreateRuntime gRPC failed: %v", err)
		return nil, fmt.Errorf("runtime service gRPC call failed: %w", err)
	}

	log.Printf("[RuntimeClient] CreateRuntime gRPC succeeded: RuntimeID=%s, Status=%s",
		res.GetRuntimeId(), res.GetStatus().String())

	return &CreateRuntimeResponse{
		RuntimeID: res.GetRuntimeId(),
		Status:    res.GetStatus().String(),
	}, nil
}

func (c *RuntimeClient) Close() error {
	if err := c.conn.Close(); err != nil {
		return fmt.Errorf("failed to close runtime client connection: %w", err)
	}

	return nil
}
