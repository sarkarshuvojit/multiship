package state

func SignupKey(sessionID string) string {
	return "signedup:" + sessionID
}
