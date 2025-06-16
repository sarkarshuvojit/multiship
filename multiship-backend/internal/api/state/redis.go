package state

import (
	"context"
	"crypto/tls"
	"errors"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

const DEFAULT_EXPIRY = time.Minute * 30

type RedisState struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisState(
	addr string, db int,
	password string, username string,
	useTLS bool,
) (*RedisState, error) {
	opts := &redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
		Username: username,
	}
	if useTLS {
		opts.TLSConfig = &tls.Config{}
	}
	rdb := redis.NewClient(opts)

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		slog.Default().Error("Redis ping failed", slog.String("error", err.Error()))
		slog.Default().Error("Tried to connect via", slog.Any("opts", opts))
		return nil, err
	}

	return &RedisState{
		client: rdb,
		ctx:    ctx,
	}, nil
}

func (r *RedisState) Set(key, value string) error {
	start := time.Now()
	err := r.client.Set(r.ctx, key, value, DEFAULT_EXPIRY).Err()
	slog.Default().Debug("Redis SET",
		slog.String("key", key),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return err
}

func (r *RedisState) Get(key string) (string, bool) {
	start := time.Now()
	val, err := r.client.Get(r.ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		slog.Default().Warn("Redis GET - key not found", slog.String("key", key))
		return "", false
	}
	slog.Default().Debug("Redis GET",
		slog.String("key", key),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return val, true
}

func (r *RedisState) Delete(key string) error {
	start := time.Now()
	n, err := r.client.Del(r.ctx, key).Result()
	slog.Default().Debug("Redis DEL",
		slog.String("key", key),
		slog.Int64("deleted_count", n),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return err
}

func (r *RedisState) Has(key string) (bool, error) {
	start := time.Now()
	n, err := r.client.Exists(r.ctx, key).Result()
	found := n > 0
	slog.Default().Debug("Redis EXISTS",
		slog.String("key", key),
		slog.Bool("exists", found),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return found, err
}

func (r *RedisState) Incr(key string) error {
	start := time.Now()

	// Try to set the key to "0" only if it doesn't exist
	_, err := r.client.SetNX(r.ctx, key, 0, 0).Result()
	if err != nil {
		slog.Default().Error("Redis SETNX failed",
			slog.String("key", key),
			slog.Duration("took", time.Since(start)),
			slog.Bool("success", false),
			slog.String("error", err.Error()),
		)
		return err
	}

	// Now safely increment
	val, err := r.client.Incr(r.ctx, key).Result()
	slog.Default().Debug("Redis INCR",
		slog.String("key", key),
		slog.Int64("new_value", val),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return err
}

// Decr decrements the value of the given key by 1 in Redis,
// initializing it to 0 if it doesn't exist.
func (r *RedisState) Decr(key string) error {
	start := time.Now()

	// Try to set the key to "0" only if it doesn't exist
	_, err := r.client.SetNX(r.ctx, key, 0, 0).Result()
	if err != nil {
		slog.Default().Error("Redis SETNX failed",
			slog.String("key", key),
			slog.Duration("took", time.Since(start)),
			slog.Bool("success", false),
			slog.String("error", err.Error()),
		)
		return err
	}

	// Now safely decrement
	val, err := r.client.Decr(r.ctx, key).Result()
	slog.Default().Debug("Redis DECR",
		slog.String("key", key),
		slog.Int64("new_value", val),
		slog.Duration("took", time.Since(start)),
		slog.Bool("success", err == nil),
	)
	return err
}

var _ State = (*RedisState)(nil)
