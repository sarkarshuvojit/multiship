package state

import (
	"errors"
	"log/slog"
	"strconv"
	"sync"
)

type InMemState struct {
	data map[string]string
	mu   sync.RWMutex
}

func NewInMemState() *InMemState {
	slog.Info("Creating new in-memory state instance")
	return &InMemState{
		data: make(map[string]string),
	}
}

func (s *InMemState) Set(key string, value string) error {
	slog.Debug("Setting key-value pair", "key", key, "value", value)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
	slog.Debug("Successfully set key-value pair", "key", key)
	return nil
}

func (s *InMemState) Get(key string) (string, bool) {
	slog.Debug("Getting key", "key", key)
	s.mu.RLock()
	defer s.mu.RUnlock()
	val, ok := s.data[key]
	slog.Debug("Get result", "key", key, "found", ok, "value", val)
	return val, ok
}

func (s *InMemState) Has(key string) (bool, error) {
	slog.Debug("Checking if key exists", "key", key)
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.data[key]
	slog.Debug("Key existence check result", "key", key, "exists", ok)
	return ok, nil
}

func (s *InMemState) Delete(key string) error {
	slog.Debug("Deleting key", "key", key)
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.data[key]; !exists {
		slog.Debug("Delete failed - key not found", "key", key)
		return errors.New("key not found")
	}
	delete(s.data, key)
	slog.Debug("Successfully deleted key", "key", key)
	return nil
}

// Incr increments the integer value stored at key by 1.
// If the key does not exist, it is initialized to 1.
func (s *InMemState) Incr(key string) error {
	slog.Debug("Incrementing key", "key", key)
	s.mu.Lock()
	defer s.mu.Unlock()

	valStr, exists := s.data[key]
	if !exists {
		s.data[key] = "1"
		slog.Debug("Initialized key to 1", "key", key)
		return nil
	}

	valInt, err := strconv.Atoi(valStr)
	if err != nil {
		slog.Debug("Increment failed - value is not an integer", "key", key, "value", valStr)
		return errors.New("value is not an integer")
	}

	valInt++
	s.data[key] = strconv.Itoa(valInt)
	slog.Debug("Successfully incremented key", "key", key, "new_value", valInt)
	return nil
}

// Decr decrements the integer value stored at key by 1.
// If the key does not exist, it is initialized to -1.
func (s *InMemState) Decr(key string) error {
	slog.Debug("Decrementing key", "key", key)
	s.mu.Lock()
	defer s.mu.Unlock()

	valStr, exists := s.data[key]
	if !exists {
		s.data[key] = "-1"
		slog.Debug("Initialized key to -1", "key", key)
		return nil
	}

	valInt, err := strconv.Atoi(valStr)
	if err != nil {
		slog.Debug("Decrement failed - value is not an integer", "key", key, "value", valStr)
		return errors.New("value is not an integer")
	}

	valInt--
	s.data[key] = strconv.Itoa(valInt)
	slog.Debug("Successfully decremented key", "key", key, "new_value", valInt)
	return nil
}

var _ State = (*InMemState)(nil)
