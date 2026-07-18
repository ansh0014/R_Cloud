package validator

import (
	"fmt"
	"os"
	"path/filepath"
)

var buildDetectionFiles = []string{
	"package.json",
	"requirements.txt",
	"pyproject.toml",
	"go.mod",
	"Cargo.toml",
	"pom.xml",
	"build.gradle",
	"Dockerfile",
}

// ValidateDependencies checks that the repository has a file that can be detected by Nixpacks/Railway.
func ValidateDependencies(repoDir string) []string {
	var errs []string

	detected := false
	for _, filename := range buildDetectionFiles {
		filePath := filepath.Join(repoDir, filename)
		if info, err := os.Stat(filePath); err == nil && !info.IsDir() {
			detected = true
			break
		}
	}

	if !detected {
		errs = append(errs, fmt.Sprintf("no supported build configuration file detected (needs one of: %v or a Dockerfile)", buildDetectionFiles))
	}

	return errs
}
