package utils

import (
	"context"
)

type ContextKey string

const (
	Melody       ContextKey = "melody"
	Session      ContextKey = "session"
	WebsocketAPI ContextKey = "wsapi"
	Redis        ContextKey = "redis"
)

func ToContext[T any](
	ctx context.Context,
	key ContextKey,
	val T,
) context.Context {
	return context.WithValue(ctx, key, val)
}

func FromContext[T any](
	ctx context.Context,
	key ContextKey,
) T {
	val := ctx.Value(key)
	return val.(T)
}
