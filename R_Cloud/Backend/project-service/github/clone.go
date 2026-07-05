package github

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func CloneRepository(repoURL, branch, destination string) error {
	if err := os.MkdirAll(destination, 0755); err != nil {
		return fmt.Errorf("failed to create clone destination: %w", err)
	}

	cmd := exec.Command("git", "clone", "--branch", branch, "--single-branch", "--depth", "1", repoURL, destination)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("git clone failed for %s: %w", repoURL, err)
	}

	return nil
}

func RepoLocalPath(baseDir, repoName string) string {
	return filepath.Join(baseDir, repoName)
}
