package state

type State interface {
	Set(string, string) error
	Get(string) (string, error)
	Has(string) (bool, error)
	Delete(string) error
}
