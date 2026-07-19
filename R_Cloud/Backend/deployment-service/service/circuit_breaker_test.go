package service

import (
	"testing"
	"time"
)

func TestCircuitBreaker_StateTransitions(t *testing.T) {
	cb := NewCircuitBreaker(3, 50*time.Millisecond)

	// Initially CLOSED
	if cb.GetState() != StateClosed {
		t.Errorf("expected initially CLOSED state, got %v", cb.GetState())
	}
	if !cb.CanExecute() {
		t.Error("expected CanExecute to be true in CLOSED state")
	}

	// 1 failure - still CLOSED
	cb.RecordFailure()
	if cb.GetState() != StateClosed {
		t.Errorf("expected CLOSED after 1 failure, got %v", cb.GetState())
	}

	// 2 failures - still CLOSED
	cb.RecordFailure()
	if cb.GetState() != StateClosed {
		t.Errorf("expected CLOSED after 2 failures, got %v", cb.GetState())
	}

	// 3 failures - trips to OPEN
	cb.RecordFailure()
	if cb.GetState() != StateOpen {
		t.Errorf("expected OPEN after 3 failures, got %v", cb.GetState())
	}
	if cb.CanExecute() {
		t.Error("expected CanExecute to be false in OPEN state")
	}

	// Wait for cooldown window (50ms) to elapse
	time.Sleep(60 * time.Millisecond)

	// CanExecute should now transition to HALF-OPEN and return true
	if !cb.CanExecute() {
		t.Error("expected CanExecute to be true after cooldown elapsed")
	}
	if cb.GetState() != StateHalfOpen {
		t.Errorf("expected HALF-OPEN state, got %v", cb.GetState())
	}

	// Success in HALF-OPEN transitions to CLOSED
	cb.RecordSuccess()
	if cb.GetState() != StateClosed {
		t.Errorf("expected CLOSED after success in HALF-OPEN, got %v", cb.GetState())
	}

	// Fail again to trip
	cb.RecordFailure()
	cb.RecordFailure()
	cb.RecordFailure()
	if cb.GetState() != StateOpen {
		t.Errorf("expected OPEN after 3 failures, got %v", cb.GetState())
	}

	// Wait for cooldown again
	time.Sleep(60 * time.Millisecond)

	if !cb.CanExecute() {
		t.Error("expected CanExecute to be true after cooldown elapsed")
	}
	if cb.GetState() != StateHalfOpen {
		t.Errorf("expected HALF-OPEN state, got %v", cb.GetState())
	}

	// Failure in HALF-OPEN re-trips immediately to OPEN
	cb.RecordFailure()
	if cb.GetState() != StateOpen {
		t.Errorf("expected OPEN immediately after failure in HALF-OPEN, got %v", cb.GetState())
	}
}
