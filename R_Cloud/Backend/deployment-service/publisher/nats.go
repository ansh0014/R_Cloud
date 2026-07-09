package publisher

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	subjectDeploymentCreated   = "deployment.created"
	subjectDeploymentCompleted = "deployment.completed"
	subjectDeploymentFailed    = "deployment.failed"
)

type DeploymentEvent struct {
	DeploymentID string    `json:"deploymentId"`
	ProjectID    string    `json:"projectId"`
	UserID       string    `json:"userId"`
	Status       string    `json:"status"`
	Timestamp    time.Time `json:"timestamp"`
}

type NATSPublisher struct {
	conn *nats.Conn
}

func NewNATSPublisher(natsURL string) (*NATSPublisher, error) {
	conn, err := nats.Connect(natsURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to nats at %s: %w", natsURL, err)
	}

	return &NATSPublisher{conn: conn}, nil
}

func (p *NATSPublisher) PublishCreated(ctx context.Context, event DeploymentEvent) error {
	return p.publish(subjectDeploymentCreated, event)
}

func (p *NATSPublisher) PublishCompleted(ctx context.Context, event DeploymentEvent) error {
	return p.publish(subjectDeploymentCompleted, event)
}

func (p *NATSPublisher) PublishFailed(ctx context.Context, event DeploymentEvent) error {
	return p.publish(subjectDeploymentFailed, event)
}

func (p *NATSPublisher) Close() {
	p.conn.Drain()
}

func (p *NATSPublisher) publish(subject string, event DeploymentEvent) error {
	payload, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal deployment event: %w", err)
	}

	if err := p.conn.Publish(subject, payload); err != nil {
		return fmt.Errorf("failed to publish to %s: %w", subject, err)
	}

	return nil
}
