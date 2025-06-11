package dto

type ResponseDto[T any] struct {
	Msg     string `json:"msg"`
	Payload T      `json:"payload"`
}

type SignupDto struct {
	Email string `json:"email"`
}

type SignupResDto struct {
	SessionID string `json:"sessionId"`
}

type JoinRoomDto struct {
	RoomCode string `json:"roomCode"`
}
