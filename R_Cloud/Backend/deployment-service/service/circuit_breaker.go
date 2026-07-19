package service

import (
	"errors"
	"sync"
	"time"
)

var ErrCircuitBreakerOpen = errors.New("Validation Service is temporarily unavailable. Please try again later.")

type BreakerState int

const (
	StateClosed BreakerState = iota
	StateOpen
	StateHalfOpen
)

type CircuitBreaker struct {
	mu               sync.RWMutex
	state            BreakerState
	failureCount     int
	lastStateChange  time.Time
	failureThreshold int
	cooldownWindow   time.Duration
}

func NewCircuitBreaker(threshold int, cooldown time.Duration) *CircuitBreaker {
	return &CircuitBreaker{
		state:            StateClosed,
		failureThreshold: threshold,
		cooldownWindow:   cooldown,
		lastStateChange:  time.Now(),
	}
}

func (cb *CircuitBreaker) CanExecute() bool {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	if cb.state == StateOpen {
		if time.Since(cb.lastStateChange) >= cb.cooldownWindow {
			cb.state = StateHalfOpen
			cb.lastStateChange = time.Now()
			return true
		}
		return false
	}
	return true
}

func (cb *CircuitBreaker) RecordSuccess() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failureCount = 0
	cb.state = StateClosed
	cb.lastStateChange = time.Now()
}

func (cb *CircuitBreaker) RecordFailure() {
	cb.mu.Lock()
	defer cb.mu.Unlock()

	cb.failureCount++
	if cb.state == StateHalfOpen || cb.failureCount >= cb.failureThreshold {
		cb.state = StateOpen
		cb.lastStateChange = time.Now()
	}
}

func (cb *CircuitBreaker) GetState() BreakerState {
	cb.mu.RLock()
	defer cb.mu.RUnlock()
	return cb.state
}
