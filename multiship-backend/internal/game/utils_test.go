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
		{
			name: "Single valid length-4 ship",
			want: false, // invalid because not all ships are placed
			arg: []ShipState{
				{X: 0, Y: 0, Dir: Horizontal, Len: 4},
			},
		},
		{
			name: "Valid complete configuration",
			want: true,
			arg: []ShipState{
				// 1x Length 4
				{X: 0, Y: 0, Dir: Horizontal, Len: 4},
				// 2x Length 3
				{X: 2, Y: 0, Dir: Horizontal, Len: 3},
				{X: 4, Y: 0, Dir: Horizontal, Len: 3},
				// 3x Length 2
				{X: 6, Y: 0, Dir: Horizontal, Len: 2},
				{X: 6, Y: 3, Dir: Horizontal, Len: 2},
				{X: 6, Y: 6, Dir: Horizontal, Len: 2},
				// 4x Length 1
				{X: 8, Y: 0, Dir: Horizontal, Len: 1},
				{X: 8, Y: 2, Dir: Horizontal, Len: 1},
				{X: 8, Y: 4, Dir: Horizontal, Len: 1},
				{X: 8, Y: 6, Dir: Horizontal, Len: 1},
			},
		},
		{
			name: "Too many ships of length 2",
			want: false,
			arg: []ShipState{
				{X: 0, Y: 0, Dir: Horizontal, Len: 4},
				{X: 2, Y: 0, Dir: Horizontal, Len: 3},
				{X: 4, Y: 0, Dir: Horizontal, Len: 3},
				{X: 6, Y: 0, Dir: Horizontal, Len: 2},
				{X: 6, Y: 3, Dir: Horizontal, Len: 2},
				{X: 6, Y: 6, Dir: Horizontal, Len: 2},
				{X: 6, Y: 9, Dir: Horizontal, Len: 2}, // One extra
				{X: 8, Y: 0, Dir: Horizontal, Len: 1},
				{X: 8, Y: 2, Dir: Horizontal, Len: 1},
				{X: 8, Y: 4, Dir: Horizontal, Len: 1},
				{X: 8, Y: 6, Dir: Horizontal, Len: 1},
			},
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
