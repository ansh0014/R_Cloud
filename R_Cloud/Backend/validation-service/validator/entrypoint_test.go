package validator

import (
	"os"
	"path/filepath"
	"testing"
)

func TestValidateReturnsConfiguredEntrypoints(t *testing.T) {
	tests := []struct {
		name            string
		config          string
		entrypoint      string
		agentEntrypoint string
		mode            string
	}{
		{
			name:       "monolith",
			mode:       ModeMonolith,
			entrypoint: "src/server.js",
			config: `application:
  name: sample-app
  mode: monolith
  entrypoint: src/server.js
routes:
  execute: /execute
  health: /health
  metadata: /metadata
`,
		},
		{
			name:            "microservices",
			mode:            ModeMicroservices,
			agentEntrypoint: "workers/agent.ts",
			config: `application:
  name: sample-app
  mode: microservices
agents:
  - id: worker
    entrypoint: workers/agent.ts
routes:
  execute: /execute
  health: /health
  metadata: /metadata
`,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			repoDir := t.TempDir()
			if err := os.WriteFile(filepath.Join(repoDir, "ragent.yaml"), []byte(test.config), 0600); err != nil {
				t.Fatal(err)
			}
			entrypoint := test.entrypoint
			if test.mode == ModeMicroservices {
				entrypoint = test.agentEntrypoint
			}
			entrypointPath := filepath.Join(repoDir, entrypoint)
			if err := os.MkdirAll(filepath.Dir(entrypointPath), 0700); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(entrypointPath, []byte("export {}\n"), 0600); err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(filepath.Join(repoDir, "package.json"), []byte(`{"scripts":{"start":"node src/server.js"}}`), 0600); err != nil {
				t.Fatal(err)
			}

			result := Validate(repoDir)
			if !result.Valid {
				t.Fatalf("expected valid config, got errors: %v", result.Errors)
			}
			if test.mode == ModeMonolith && result.Entrypoint != test.entrypoint {
				t.Fatalf("expected monolith entrypoint %q, got %q", test.entrypoint, result.Entrypoint)
			}
			if test.mode == ModeMicroservices && (len(result.Agents) != 1 || result.Agents[0].Entrypoint != test.agentEntrypoint) {
				t.Fatalf("expected microservice entrypoint %q, got %#v", test.agentEntrypoint, result.Agents)
			}
		})
	}
}

func TestValidateRequiresMonolithEntrypoint(t *testing.T) {
	repoDir := t.TempDir()
	config := `application:
  name: sample-app
  mode: monolith
routes:
  execute: /execute
  health: /health
  metadata: /metadata
`
	if err := os.WriteFile(filepath.Join(repoDir, "ragent.yaml"), []byte(config), 0600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(repoDir, "package.json"), []byte(`{}`), 0600); err != nil {
		t.Fatal(err)
	}

	result := Validate(repoDir)
	if result.Valid {
		t.Fatal("expected monolith without application.entrypoint to fail validation")
	}
	if len(result.Errors) == 0 || result.Errors[0] != "monolith mode requires application.entrypoint in ragent.yaml" {
		t.Fatalf("expected missing monolith entrypoint error, got %v", result.Errors)
	}
}
