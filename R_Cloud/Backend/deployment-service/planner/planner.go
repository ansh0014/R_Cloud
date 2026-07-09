package planner

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

type RagentConfig struct {
	Application ApplicationConfig `yaml:"application"`
	Agents      []AgentConfig     `yaml:"agents"`
	Routes      RoutesConfig      `yaml:"routes"`
}

type ApplicationConfig struct {
	Name string `yaml:"name"`
	Mode string `yaml:"mode"`
}

type AgentConfig struct {
	ID         string `yaml:"id"`
	Entrypoint string `yaml:"entrypoint"`
}

type RoutesConfig struct {
	Execute  string `yaml:"execute"`
	Health   string `yaml:"health"`
	Metadata string `yaml:"metadata"`
}

func ParseRagentYAML(repoDir string) (*RagentConfig, error) {
	ragentPath := filepath.Join(repoDir, "ragent.yaml")

	data, err := os.ReadFile(ragentPath)
	if err != nil {
		return nil, fmt.Errorf("ragent.yaml not found in repository root: %w", err)
	}

	var cfg RagentConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse ragent.yaml: %w", err)
	}

	return &cfg, nil
}
