# 06 — Validation Service

> Validates AI repositories before deployment.

---

# Overview

The Validation Service validates that an AI repository is correctly structured and ready to deploy.

Validation runs before any infrastructure is provisioned.

If validation fails, deployment is rejected immediately.

---

# Responsibilities

- Validate ragent.yaml exists
- Validate mode value (monolith or microservices)
- Validate entrypoints exist in the repository
- Validate runtime contract routes are defined
- Validate environment variables are declared

---

# Folder Structure

```
Backend/deployment/validator/
└── ragent_validator.go    ← all validation logic
```

---

# Validation Checks

## ragent.yaml Exists

Must be in repository root. If missing: fail.

## Mode is Valid

Allowed values: `monolith` or `microservices`. Anything else: fail.

## Entrypoints Exist

For microservices mode, every agent entrypoint file must exist in the repository.

## Routes Defined

The following routes must be declared in ragent.yaml:

```yaml
routes:
  execute: /execute
  health: /health
  metadata: /metadata
```

---

# Validation Flow

```text
ragent.yaml exists? → No: FAIL
mode is valid?      → No: FAIL
entrypoints exist?  → No: FAIL
routes defined?     → No: FAIL
                    → Yes: PASS → proceed to deployment
```

---

# Validation Response

Success:

```json
{
  "valid": true,
  "mode": "microservices",
  "agents": ["planner", "researcher"]
}
```

Failure:

```json
{
  "valid": false,
  "errors": ["Missing ragent.yaml", "Missing /health route"]
}
```

---

# Circuit Breaker Specification

To protect the Deployment Service from cascading resource exhaustion when the Validation Service is unreachable or down, a Circuit Breaker pattern must be implemented in the Deployment Service client calling the Validation Service.

## Configuration Parameters

- **Failure Threshold:** 5 consecutive failed validation requests.
- **Cooldown Window:** 30 seconds (time spent in `OPEN` state before transitioning to `HALF-OPEN`).
- **Request Timeout:** 5 seconds (maximum wait time for a validation request before counting it as a failure).

## State Flow & Fallback Behavior

1. **Closed (Healthy):** All requests pass through to the Validation Service normally.
2. **Open (Tripped):** When the failure threshold is reached, the breaker trips. All subsequent validation requests fail-fast immediately for the duration of the cooldown window.
   - **Fallback Response:** 
     ```json
     {
       "success": false,
       "error": "Validation Service is temporarily unavailable. Please try again later."
     }
     ```
3. **Half-Open (Trial):** After the cooldown window, the next single request is allowed to hit the Validation Service:
   - **If Success:** Reset failure count and return to `CLOSED`.
   - **If Failure:** Re-trip to `OPEN` and reset the cooldown window.

