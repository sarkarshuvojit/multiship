package state

type State interface {
	Set(string, string) error
	Get(string) (string, bool)
	Has(string) (bool, error)
	Delete(string) error
}
