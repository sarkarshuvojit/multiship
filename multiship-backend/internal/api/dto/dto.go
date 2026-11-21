package dto

import "github.com/sarkarshuvojit/multiship-backend/internal/game"

type ResponseDto[T any] struct {
	Msg     string `json:"msg"`
	Payload T      `json:"payload"`
}

type SignupDto struct {
	Email  string `json:"email"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

type SignupResDto struct {
	SessionID string `json:"sessionId"`
}

type JoinRoomDto struct {
	RoomCode string `json:"roomCode"`
}

type SubmitBoardDto struct {
	RoomID string           `json:"roomId"`
	Ships  []game.ShipState `json:"ships"`
}

type RoomIDDto struct {
	RoomID string `json:"roomId"`
}

type RemoveBotDto struct {
	RoomID string `json:"roomId"`
	BotID  string `json:"botId"`
}
