package models

import "time"


type Project struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	Name           string    `json:"name"`
	Description    string    `json:"description"`
	GithubRepoURL  string    `json:"githubRepoUrl"`
	GithubRepoName string    `json:"githubRepoName"`
	GithubOwner    string    `json:"githubOwner"`
	DefaultBranch  string    `json:"defaultBranch"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
