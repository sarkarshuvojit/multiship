package repo

import (
	"strings"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/utils"
)

type Profile struct {
	Email  string `json:"email"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
}

// GetProfile returns the signup profile for a session. A missing name falls
// back to the local part of the email so every player has a display name.
func GetProfile(db state.State, sessionID string) (Profile, bool) {
	raw, found := db.Get(state.SessionKey(sessionID))
	if !found {
		return Profile{}, false
	}
	var p Profile
	utils.QuickUnmarshal(raw, &p)
	if p.Name == "" {
		p.Name = strings.Split(p.Email, "@")[0]
	}
	if p.Name == "" {
		p.Name = "Captain"
	}
	return p, true
}

func SetSessionRoom(db state.State, sessionID string, roomID string) error {
	return db.Set(state.SessionRoomKey(sessionID), roomID)
}

func GetSessionRoom(db state.State, sessionID string) (string, bool) {
	roomID, found := db.Get(state.SessionRoomKey(sessionID))
	return roomID, found && roomID != ""
}

func ClearSessionRoom(db state.State, sessionID string) error {
	return db.Delete(state.SessionRoomKey(sessionID))
}
