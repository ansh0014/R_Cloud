package github

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type WebhookEvent struct {
	Ref        string     `json:"ref"`
	Repository Repository `json:"repository"`
	HeadCommit Commit     `json:"head_commit"`
}

type Repository struct {
	Name     string `json:"name"`
	CloneURL string `json:"clone_url"`
}

type Commit struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

func ParseWebhookEvent(r *http.Request, secret string) (*WebhookEvent, error) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read webhook body: %w", err)
	}
	defer r.Body.Close()

	if err := verifySignature(body, secret, r.Header.Get("X-Hub-Signature-256")); err != nil {
		return nil, err
	}

	var event WebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		return nil, fmt.Errorf("failed to parse webhook payload: %w", err)
	}

	return &event, nil
}

func verifySignature(body []byte, secret, signature string) error {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(signature)) {
		return fmt.Errorf("webhook signature mismatch")
	}

	return nil
}
