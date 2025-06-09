package dto

type ResponseDto[T any] struct {
	Msg     string `json:"msg"`
	Payload T      `json:"payload"`
}

type SignupDto struct {
	Email string `json:"email"`
}
