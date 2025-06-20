package game

import "testing"

func Test_validateBoard(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		want bool
		arg  []ShipState
	}{
		{
			name: "Should fail for empty array",
			want: false,
			arg:  []ShipState{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := validateBoard(tt.arg)
			if tt.want != got {
				t.Errorf("validateBoard() = %v, want %v", got, tt.want)
			}
		})
	}
}
