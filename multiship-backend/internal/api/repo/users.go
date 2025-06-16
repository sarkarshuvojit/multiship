package repo

import (
	"strconv"

	"github.com/sarkarshuvojit/multiship-backend/internal/api/state"
	"github.com/sarkarshuvojit/multiship-backend/internal/api/state/keys"
)

func IncrementLiveUsers(db state.State) error {
	if err := db.Incr(keys.LiveUsers()); err != nil {
		return err
	}
	return nil
}

func DecrementLiveUsers(db state.State) error {
	if err := db.Decr(keys.LiveUsers()); err != nil {
		return err
	}
	return nil
}

func GetLiveUsers(db state.State) (int, error) {
	val, found := db.Get(keys.LiveUsers())
	if !found {
		return 0, nil
	}

	ival, err := strconv.Atoi(val)
	if err != nil {
		return 0, nil
	}

	return ival, nil
}
