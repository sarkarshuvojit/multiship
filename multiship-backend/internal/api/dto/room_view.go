package dto

import "github.com/sarkarshuvojit/multiship-backend/internal/game"

// PlayerView is the public view of a player: ship positions are never sent,
// only the shots fired at them and ships that have been sunk.
type PlayerView struct {
	SessionID      string             `json:"sessionId"`
	Name           string             `json:"name"`
	Avatar         string             `json:"avatar"`
	Status         game.PlayerStatus  `json:"status"`
	IsHost         bool               `json:"isHost"`
	Eliminated     bool               `json:"eliminated"`
	Board          [][]game.CellState `json:"board"`
	ShipsRemaining int                `json:"shipsRemaining"`
	SunkShips      []game.ShipState   `json:"sunkShips"`
}

type RoomView struct {
	RoomID        string          `json:"roomId"`
	Code          string          `json:"code"`
	Status        game.RoomStatus `json:"status"`
	HostID        string          `json:"hostId"`
	CurrentPlayer string          `json:"currentPlayer"`
	WinnerID      string          `json:"winnerId"`
	MaxPlayers    int             `json:"maxPlayers"`
	Players       []PlayerView    `json:"players"`
}

func NewRoomView(room *game.RoomState, maxPlayers int) RoomView {
	players := make([]PlayerView, 0, len(room.PlayerSessions))
	for _, id := range room.PlayerSessions {
		p, ok := room.Players[id]
		if !ok {
			continue
		}
		board := p.Board
		if len(board) == 0 {
			board = game.NewBoard()
		}
		players = append(players, PlayerView{
			SessionID:      id,
			Name:           p.Name,
			Avatar:         p.Avatar,
			Status:         p.Status,
			IsHost:         id == room.LeaderSessionID,
			Eliminated:     p.Eliminated,
			Board:          board,
			ShipsRemaining: game.ShipsRemaining(p.Ships, p.Board),
			SunkShips:      game.SunkShips(p.Ships, p.Board),
		})
	}
	return RoomView{
		RoomID:        room.RoomID,
		Code:          room.Code,
		Status:        room.Status,
		HostID:        room.LeaderSessionID,
		CurrentPlayer: room.CurrentPlayer,
		WinnerID:      room.WinnerID,
		MaxPlayers:    maxPlayers,
		Players:       players,
	}
}
