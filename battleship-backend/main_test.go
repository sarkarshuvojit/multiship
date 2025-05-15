// File: main_test.go
package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
)

func TestHappyFlow(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(handleConnection))
	defer server.Close()

	u := "ws" + server.URL[4:] + "/ws"

	dial := func() *websocket.Conn {
		c, _, err := websocket.DefaultDialer.Dial(u, nil)
		if err != nil {
			t.Fatal(err)
		}
		return c
	}

	conn1 := dial()
	conn2 := dial()
	conn3 := dial()

	// Create Room
	conn1.WriteJSON(Message{Event: "create_room", Data: toRaw(map[string]string{"userName": "Alice"})})
	resp1 := readMsg(t, conn1)
	roomCode := resp1["roomCode"].(string)

	// Join Room
	conn2.WriteJSON(Message{Event: "join_room", Data: toRaw(map[string]string{"userName": "Bob", "roomCode": roomCode})})
	readMsg(t, conn2)
	conn3.WriteJSON(Message{Event: "join_room", Data: toRaw(map[string]string{"userName": "Charlie", "roomCode": roomCode})})
	readMsg(t, conn3)

	// Setup Board
	setupData := func(user string) Message {
		return Message{
			Event: "setup_board",
			Data: toRaw(SetupBoardRequest{
				UserName: user,
				RoomCode: roomCode,
				BoardConfig: []BoardBlock{{
					BlockLength:      2,
					BlockStartPos:    Position{X: 1, Y: 1},
					BlockOrientation: HORIZONTAL,
				}},
			}),
		}
	}
	conn1.WriteJSON(setupData("Alice"))
	readMsg(t, conn1)
	conn2.WriteJSON(setupData("Bob"))
	readMsg(t, conn2)
	conn3.WriteJSON(setupData("Charlie"))
	readMsg(t, conn3)
	msg := readMsg(t, conn1) // Should be game_start
	assert.Equal(t, "game_start", msg["event"])
}

func toRaw(v interface{}) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}

func readMsg(t *testing.T, conn *websocket.Conn) map[string]interface{} {
	_, msg, err := conn.ReadMessage()
	if err != nil {
		t.Fatal(err)
	}
	var m map[string]interface{}
	json.Unmarshal(msg, &m)
	return m
}
