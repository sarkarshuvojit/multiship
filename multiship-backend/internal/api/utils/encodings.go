package utils

import "encoding/json"

func QuickMarshal(v any) string {
	s, err := json.Marshal(v)
	if err != nil {
		panic("This cannot be true")
	}
	return string(s)
}

func QuickUnmarshal(content string, v any) {
	err := json.Unmarshal([]byte(content), v)
	if err != nil {
		panic("This cannot be true")
	}
}
