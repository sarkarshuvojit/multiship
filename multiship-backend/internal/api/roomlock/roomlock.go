// Package roomlock serialises read-modify-write cycles on a single room so
// concurrent events (shots, joins, leaves, recomputes) cannot clobber each other.
package roomlock

import "sync"

var locks sync.Map

// Lock acquires the lock for roomID and returns the matching unlock func.
func Lock(roomID string) func() {
	v, _ := locks.LoadOrStore(roomID, &sync.Mutex{})
	mu := v.(*sync.Mutex)
	mu.Lock()
	return mu.Unlock
}
