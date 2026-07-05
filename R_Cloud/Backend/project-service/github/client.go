package github

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// GitHubClient handles communication with the GitHub REST API.
type GitHubClient struct {
	token          string
	requestTimeout time.Duration
}

// RepositoryResponse holds the fields returned by the GitHub repo API.
type RepositoryResponse struct {
	Name          string `json:"name"`
	DefaultBranch string `json:"default_branch"`
	CloneURL      string `json:"clone_url"`
	Owner         struct {
		Login string `json:"login"`
	} `json:"owner"`
}

// NewGitHubClient creates a GitHubClient with a bearer token and configurable request timeout.
func NewGitHubClient(token string, requestTimeout time.Duration) *GitHubClient {
	return &GitHubClient{
		token:          token,
		requestTimeout: requestTimeout,
	}
}

// ValidateRepository checks that a GitHub repository exists and is accessible.
// It returns the repository metadata on success.
func (c *GitHubClient) ValidateRepository(repoURL string) (*RepositoryResponse, error) {
	owner, repoName, err := parseRepoURL(repoURL)
	if err != nil {
		return nil, err
	}

	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s", owner, repoName)

	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to build github request: %w", err)
	}

	req.Header.Set("Accept", "application/vnd.github.v3+json")

	// Token is required — validated at startup via config
	req.Header.Set("Authorization", "Bearer "+c.token)

	httpClient := &http.Client{Timeout: c.requestTimeout}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("github request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github returned status %s for repository %s/%s", resp.Status, owner, repoName)
	}

	var repoInfo RepositoryResponse
	if err := json.NewDecoder(resp.Body).Decode(&repoInfo); err != nil {
		return nil, fmt.Errorf("failed to parse github response: %w", err)
	}

	return &repoInfo, nil
}

// parseRepoURL extracts the owner and repository name from a GitHub URL.
// Expected format: https://github.com/owner/repo
func parseRepoURL(repoURL string) (owner string, repoName string, err error) {
	cleaned := strings.TrimSuffix(repoURL, "/")
	parts := strings.Split(cleaned, "/")

	if len(parts) < 2 {
		return "", "", fmt.Errorf("invalid github repository url: %s", repoURL)
	}

	return parts[len(parts)-2], parts[len(parts)-1], nil
}
