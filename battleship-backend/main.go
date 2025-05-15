package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type MatchState string

const (
	WAITING_FOR_PLAYERS MatchState = "WAITING_FOR_PLAYERS"
	ALL_PLAYERS_JOINED  MatchState = "ALL_PLAYERS_JOINED"
	GAME_BEGIN          MatchState = "GAME_BEGIN"
)

type Orientation string

const (
	HORIZONTAL Orientation = "HORIZONTAL"
	VERTICAL   Orientation = "VERTICAL"
)

type BoardBlock struct {
	BlockLength      int         `json:"blockLength"`
	BlockStartPos    Position    `json:"blockStartPos"`
	BlockOrientation Orientation `json:"blockOrientation"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type Player struct {
	UserName    string
	Conn        *websocket.Conn
	Board       []BoardBlock
	Ready       bool
	PlayerIndex int
}

type Room struct {
	Code       string
	Players    []*Player
	State      MatchState
	Mutex      sync.Mutex
	TurnIndex  int
	Eliminated map[string]bool
}

var rooms = make(map[string]*Room)
var roomsMutex sync.Mutex

type Message struct {
	Event string          `json:"event"`
	Data  json.RawMessage `json:"data"`
}

func main() {
	http.HandleFunc("/ws", handleConnection)
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("read error:", err)
			return
		}

		switch msg.Event {
		case "create_room":
			handleCreateRoom(conn, msg.Data)
		case "join_room":
			handleJoinRoom(conn, msg.Data)
		case "setup_board":
			handleSetupBoard(conn, msg.Data)
		case "bomb_it":
			handleBombIt(conn, msg.Data)
		}
	}
}

type CreateRoomRequest struct {
	UserName string `json:"userName"`
}

type JoinRoomRequest struct {
	UserName string `json:"userName"`
	RoomCode string `json:"roomCode"`
}

type SetupBoardRequest struct {
	UserName    string       `json:"userName"`
	RoomCode    string       `json:"roomCode"`
	BoardConfig []BoardBlock `json:"boardConfig"`
}

type BombRequest struct {
	RoomCode       string `json:"roomCode"`
	TargetUserName string `json:"targetUserName"`
	X              int    `json:"x"`
	Y              int    `json:"y"`
}

func handleCreateRoom(conn *websocket.Conn, data json.RawMessage) {
	var req CreateRoomRequest
	json.Unmarshal(data, &req)

	roomCode := uuid.NewString()[:6]
	player := &Player{UserName: req.UserName, Conn: conn, PlayerIndex: 0}
	room := &Room{
		Code:       roomCode,
		Players:    []*Player{player},
		State:      WAITING_FOR_PLAYERS,
		Eliminated: map[string]bool{},
	}

	roomsMutex.Lock()
	rooms[roomCode] = room
	roomsMutex.Unlock()

	conn.WriteJSON(map[string]any{
		"event":    "room_created",
		"roomCode": roomCode,
	})
}

func handleJoinRoom(conn *websocket.Conn, data json.RawMessage) {
	var req JoinRoomRequest
	json.Unmarshal(data, &req)

	roomsMutex.Lock()
	room, ok := rooms[req.RoomCode]
	roomsMutex.Unlock()

	if !ok {
		conn.WriteJSON(map[string]any{"event": "error", "message": "Room not found"})
		return
	}

	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	if len(room.Players) >= 3 {
		conn.WriteJSON(map[string]any{"event": "error", "message": "Room is full"})
		return
	}

	player := &Player{UserName: req.UserName, Conn: conn, PlayerIndex: len(room.Players)}
	room.Players = append(room.Players, player)

	if len(room.Players) == 3 {
		room.State = ALL_PLAYERS_JOINED
	}

	conn.WriteJSON(map[string]any{
		"event":   "joined_room",
		"player#": player.PlayerIndex + 1,
	})
}

func handleSetupBoard(conn *websocket.Conn, data json.RawMessage) {
	var req SetupBoardRequest
	json.Unmarshal(data, &req)

	room := rooms[req.RoomCode]
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	for _, player := range room.Players {
		if player.UserName == req.UserName {
			player.Board = req.BoardConfig
			player.Ready = true
			break
		}
	}

	conn.WriteJSON(map[string]any{"event": "board_setup_ack"})

	ready := true
	for _, p := range room.Players {
		if !p.Ready {
			ready = false
			break
		}
	}
	if ready {
		room.State = GAME_BEGIN
		broadcast(room, map[string]any{
			"event":         "game_start",
			"currentPlayer": room.Players[room.TurnIndex].UserName,
		})
	}
}

func handleBombIt(conn *websocket.Conn, data json.RawMessage) {
	var req BombRequest
	json.Unmarshal(data, &req)

	room := rooms[req.RoomCode]
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	result := "MISS"
	anotherTurn := false

	for _, p := range room.Players {
		if p.UserName == req.TargetUserName && !room.Eliminated[p.UserName] {
			for _, block := range p.Board {
				if inBlock(req.X, req.Y, block) {
					result = "HIT"
					anotherTurn = true
					break
				}
			}
			break
		}
	}

	if !anotherTurn {
		for {
			room.TurnIndex = (room.TurnIndex + 1) % 3
			if !room.Eliminated[room.Players[room.TurnIndex].UserName] {
				break
			}
		}
	}

	conn.WriteJSON(map[string]any{
		"event":       "bomb_result",
		"result":      result,
		"anotherTurn": anotherTurn,
	})

	broadcast(room, map[string]any{
		"event":         "next_turn",
		"currentPlayer": room.Players[room.TurnIndex].UserName,
	})
}

func inBlock(x int, y int, block BoardBlock) bool {
	for i := range block.BlockLength {
		if block.BlockOrientation == HORIZONTAL {
			if x == block.BlockStartPos.X+i && y == block.BlockStartPos.Y {
				return true
			}
		} else {
			if x == block.BlockStartPos.X && y == block.BlockStartPos.Y+i {
				return true
			}
		}
	}
	return false
}

func broadcast(room *Room, msg any) {
	for _, p := range room.Players {
		p.Conn.WriteJSON(msg)
	}
}
