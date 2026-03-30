package utils

import "time"

// Now returns the current time
func Now() time.Time {
	return time.Now()
}

// TimePtr returns a pointer to a time.Time value
func TimePtr(t time.Time) *time.Time {
	return &t
}

// IntPtr returns a pointer to an int value
func IntPtr(i int) *int {
	return &i
}
