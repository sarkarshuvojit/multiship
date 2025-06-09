package state

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisState struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisState(addr string, db int, password string) (*RedisState, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		slog.Default().Error("Redis ping failed", slog.String("error", err.Error()))
		return nil, err
	}

	return &RedisState{
		client: rdb,
		ctx:    ctx,
	}, nil
}

func (r *RedisState) Set(key, value string) error {
	start := time.Now()
	err := r.client.Set(r.ctx, key, value, 0).Err()
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

var _ State = (*RedisState)(nil)
