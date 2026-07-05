package github

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const githubOAuthTokenURL = "https://github.com/login/oauth/access_token"

type OAuthConfig struct {
	ClientID     string
	ClientSecret string
}

type OAuthTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
}

func ExchangeCodeForToken(ctx context.Context, cfg OAuthConfig, code string) (*OAuthTokenResponse, error) {
	url := fmt.Sprintf("%s?client_id=%s&client_secret=%s&code=%s",
		githubOAuthTokenURL, cfg.ClientID, cfg.ClientSecret, code)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build oauth token request: %w", err)
	}

	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("oauth token exchange failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("oauth token exchange returned status %s", resp.Status)
	}

	var tokenResp OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to parse oauth token response: %w", err)
	}

	return &tokenResp, nil
}
