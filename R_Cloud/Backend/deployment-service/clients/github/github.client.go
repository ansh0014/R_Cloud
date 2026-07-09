package github

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func CloneRepository(ctx context.Context, repoURL, branch, baseDir, repoName string, timeout time.Duration) (string, error) {
	destination := filepath.Join(baseDir, repoName)

	if err := os.MkdirAll(destination, 0755); err != nil {
		return "", fmt.Errorf("failed to create clone destination: %w", err)
	}

	cloneCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(cloneCtx, "git", "clone",
		"--branch", branch,
		"--single-branch",
		"--depth", "1",
		repoURL,
		destination,
	)

	if output, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("git clone failed for %s: %s: %w", repoURL, string(output), err)
	}

	return destination, nil
}

func GetHeadCommitHash(repoDir string) (string, error) {
	cmd := exec.Command("git", "-C", repoDir, "rev-parse", "HEAD")

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("failed to get commit hash: %w", err)
	}

	commitHash := string(output)
	if len(commitHash) > 0 && commitHash[len(commitHash)-1] == '\n' {
		commitHash = commitHash[:len(commitHash)-1]
	}

	return commitHash, nil
}

func Cleanup(repoDir string) error {
	if err := os.RemoveAll(repoDir); err != nil {
		return fmt.Errorf("failed to cleanup clone directory %s: %w", repoDir, err)
	}

	return nil
}
