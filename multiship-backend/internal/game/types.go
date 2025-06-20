package game

type RoomStatus string

const (
	Idle           RoomStatus = "IDLE"
	Waiting                   = "WAITING"
	BoardSelection            = "BOARD_SELECTION"
	PlayersReady              = "PLAYERS_READY"
	Ongoing                   = "ONGOING"
)

type CellState string

const (
	Hidden CellState = "HIDDEN"
	Hit    CellState = "HIT"
	Miss   CellState = "MISS"
)

type ShipDirection string

const (
	Horizontal ShipDirection = "HORIZONTAL"
	Vertical                 = "VERTICAL"
)

type ShipState struct {
	X   int           `json:"x"`
	Y   int           `json:"y"`
	Dir ShipDirection `json:"dir"`
	Len int           `json:"len"`
}

type PlayerStatus string

const (
	Joined      PlayerStatus = "JOINED"
	BoardReady               = "BOARD_READY"
	CurrentTurn              = "CURRENT_TURN"
)

type PlayerState struct {
	SessionID string        `json:"sessionId"`
	Status    PlayerStatus  `json:"status"`
	Board     [][]CellState `json:"board"`
	Ships     []ShipState   `json:"ships"`
}

func NewPlayer(sessionID string) *PlayerState {
	return &PlayerState{
		SessionID: sessionID,
		Status:    Joined,
		Board:     [][]CellState{},
		Ships:     []ShipState{},
	}
}
