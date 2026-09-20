package redis

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type UpstashClient struct {
	RestURL    string
	Token      string
	httpClient *http.Client
}

func ConnectUpstash(restURL, token string) (*UpstashClient, error) {
	if restURL == "" || token == "" {
		return nil, fmt.Errorf("upstash URL and Token are required")
	}

	client := &UpstashClient{
		RestURL: restURL,
		Token:   token,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}

	log.Println("Initialized Upstash Redis infrastructure client")
	return client, nil
}

type UpstashResponse struct {
	Result interface{} `json:"result"`
	Error  string      `json:"error,omitempty"`
}

func (u *UpstashClient) Command(ctx context.Context, cmd []interface{}) (interface{}, error) {
	body, err := json.Marshal(cmd)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Upstash command: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.RestURL, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create Upstash request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+u.Token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := u.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute Upstash HTTP request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read Upstash response body: %w", err)
	}

	var res UpstashResponse
	if err := json.Unmarshal(respBody, &res); err != nil {
		return nil, fmt.Errorf("failed to parse Upstash response: %w", err)
	}

	if res.Error != "" {
		return nil, fmt.Errorf("Upstash Redis error: %s", res.Error)
	}

	return res.Result, nil
}

func (u *UpstashClient) Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error {
	var valStr string
	switch v := value.(type) {
	case string:
		valStr = v
	default:
		data, err := json.Marshal(value)
		if err != nil {
			return err
		}
		valStr = string(data)
	}

	var cmd []interface{}
	if ttlSeconds > 0 {
		cmd = []interface{}{"SET", key, valStr, "EX", ttlSeconds}
	} else {
		cmd = []interface{}{"SET", key, valStr}
	}

	_, err := u.Command(ctx, cmd)
	return err
}

func (u *UpstashClient) Get(ctx context.Context, key string) (string, error) {
	cmd := []interface{}{"GET", key}
	res, err := u.Command(ctx, cmd)
	if err != nil {
		return "", err
	}

	if res == nil {
		return "", nil
	}

	strVal, ok := res.(string)
	if !ok {
		return "", fmt.Errorf("unexpected Upstash response type: %T", res)
	}

	return strVal, nil
}

func (u *UpstashClient) Delete(ctx context.Context, key string) error {
	cmd := []interface{}{"DEL", key}
	_, err := u.Command(ctx, cmd)
	return err
}
