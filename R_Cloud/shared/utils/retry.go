package utils

import (
	"fmt"
	"time"
)

func Retry(attempts int, delay time.Duration, fn func() error) error {
	for i := range attempts {
		err := fn()
		if err == nil {
			return nil
		}
		if i < attempts-1 {
			time.Sleep(delay)
		}
		if i == attempts-1 {
			return fmt.Errorf("all %d attempts failed: %w", attempts, err)
		}
	}
	return nil
}
