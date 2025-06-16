package state

import (
	"errors"
	"strconv"
	"sync"
)

type InMemState struct {
	data map[string]string
	mu   sync.RWMutex
}

func NewInMemState() *InMemState {
	return &InMemState{
		data: make(map[string]string),
	}
}

func (s *InMemState) Set(key string, value string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[key] = value
	return nil
}

func (s *InMemState) Get(key string) (string, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	val, ok := s.data[key]
	return val, ok
}

func (s *InMemState) Has(key string) (bool, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.data[key]
	return ok, nil
}

func (s *InMemState) Delete(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.data[key]; !exists {
		return errors.New("key not found")
	}
	delete(s.data, key)
	return nil
}

// Incr increments the integer value stored at key by 1.
// If the key does not exist, it is initialized to 1.
func (s *InMemState) Incr(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	valStr, exists := s.data[key]
	if !exists {
		s.data[key] = "1"
		return nil
	}

	valInt, err := strconv.Atoi(valStr)
	if err != nil {
		return errors.New("value is not an integer")
	}

	valInt++
	s.data[key] = strconv.Itoa(valInt)
	return nil
}

// Decr decrements the integer value stored at key by 1.
// If the key does not exist, it is initialized to -1.
func (s *InMemState) Decr(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	valStr, exists := s.data[key]
	if !exists {
		s.data[key] = "-1"
		return nil
	}

	valInt, err := strconv.Atoi(valStr)
	if err != nil {
		return errors.New("value is not an integer")
	}

	valInt--
	s.data[key] = strconv.Itoa(valInt)
	return nil
}

var _ State = (*InMemState)(nil)
