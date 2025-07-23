package game

type RoomStatus string

const (
	RoomStatusIdle           RoomStatus = "IDLE"
	RoomStatusWaiting        RoomStatus = "WAITING"
	RoomStatusBoardSelection RoomStatus = "BOARD_SELECTION"
	RoomStatusPlayersReady   RoomStatus = "PLAYERS_READY"
	RoomStatusOngoing        RoomStatus = "ONGOING"
)

type CellState string

const (
	CellStateHidden CellState = "HIDDEN"
	CellStateHit    CellState = "HIT"
	CellStateMiss   CellState = "MISS"
)

type ShipDirection string

const (
	Horizontal ShipDirection = "HORIZONTAL"
	Vertical   ShipDirection = "VERTICAL"
)

type ShipState struct {
	X   int           `json:"x"`
	Y   int           `json:"y"`
	Dir ShipDirection `json:"direction"`
	Len int           `json:"length"`
}

type PlayerStatus string

const (
	PlayerStatusJoined      PlayerStatus = "JOINED"
	PlayerStatusBoardReady  PlayerStatus = "BOARD_READY"
	PlayerStatusCurrentTurn PlayerStatus = "CURRENT_TURN"
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
		Status:    PlayerStatusJoined,
		Board:     [][]CellState{},
		Ships:     []ShipState{},
	}
}
