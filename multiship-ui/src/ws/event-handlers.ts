import { HEALTH_CHECKED, LIVE_USERS_UPDATED } from "@/features/health/health-slice";
import { gameActions } from "@/features/game/game-slice";
import { OutboundEventType, type OutboundEvent } from "@/types/wsevents";
import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";

export function handleWsEvent(event: OutboundEvent, store: { dispatch: Dispatch<UnknownAction> }) {
  const { dispatch } = store;
  const payload = event.payload;

  switch (event.eventType) {
    case OutboundEventType.WELCOME:
      dispatch(HEALTH_CHECKED(payload));
      dispatch(gameActions.connected({ sessionId: payload.sessionId }));
      break;
    case OutboundEventType.LIVE_USERS_UPDATED:
      dispatch(LIVE_USERS_UPDATED(payload));
      break;
    case OutboundEventType.SIGNED_UP:
      dispatch(gameActions.signedUp(payload.payload));
      break;
    case OutboundEventType.ROOM_CREATED:
    case OutboundEventType.ROOM_JOINED:
      dispatch(gameActions.roomEntered());
      break;
    case OutboundEventType.ROOM_LEFT:
      dispatch(gameActions.roomLeft());
      break;
    case OutboundEventType.ROOM_STATE:
      dispatch(gameActions.roomStateReceived(payload));
      break;
    case OutboundEventType.BOARD_SUBMITTED:
      dispatch(gameActions.boardSubmitted());
      break;
    case OutboundEventType.NEXT_TURN:
      dispatch(gameActions.nextTurn(payload));
      break;
    case OutboundEventType.HIT_ATTEMPTED:
      dispatch(gameActions.hitAttempted(payload));
      break;
    case OutboundEventType.SHIP_SUNK:
      dispatch(gameActions.shipSunk(payload));
      break;
    case OutboundEventType.PLAYER_ELIMINATED:
      dispatch(gameActions.playerEliminated(payload));
      break;
    case OutboundEventType.GAME_OVER:
      dispatch(gameActions.gameOver(payload));
      break;
    case OutboundEventType.BOARD_UPDATED:
      // Covered by ROOM_STATE, which carries the full board.
      break;
    case OutboundEventType.GENERAL_ERROR:
      dispatch(gameActions.errorReceived(payload));
      break;
    default:
      console.warn(`Unhandled eventType: ${event.eventType}`);
  }
}
