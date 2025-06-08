package utils

import (
	"context"
)

type ContextKey string

const (
	Melody       ContextKey = "melody"
	Session                 = "session"
	WebsocketAPI            = "wsapi"
	Redis                   = "redis"
)

func SetToContext[T any](
	ctx context.Context,
	key ContextKey,
	val T,
) context.Context {
	return context.WithValue(ctx, key, val)
}

func GetFromContextGeneric[T any](
	ctx context.Context,
	key ContextKey,
) T {
	val := ctx.Value(key)
	return val.(T)
}
