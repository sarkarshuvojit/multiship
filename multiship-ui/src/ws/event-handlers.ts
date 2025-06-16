// ws/eventHandlers.ts

import { HEALTH_CHECKED, LIVE_USERS_UPDATED } from "@/features/health/health-slice";
import { OutboundEventType, type OutboundEvent } from "@/types/wsevents";

export function handleWsEvent(event: OutboundEvent, store: any) {
  switch (event.eventType) {
    case 'WELCOME':
      store.dispatch({ type: HEALTH_CHECKED.type, payload: event.payload });
    break;
    case OutboundEventType.LIVE_USERS_UPDATED:
      store.dispatch({ type: LIVE_USERS_UPDATED.type, payload: event.payload });
    break;
    case 'SIGNED_UP':
      store.dispatch({ type: 'player/signedUp', payload: event.payload });
      break;
    case 'ROOM_CREATED':
      store.dispatch({ type: 'game/roomCreated', payload: event.payload });
      break;
    case 'HIT_RESULT':
      store.dispatch({ type: 'game/hitResult', payload: event.payload });
      break;
    case 'GENERAL_ERROR':
      store.dispatch({ type: 'ui/errorOccurred', payload: event.payload });
      break;
    // Add more event handlers
    default:
      console.warn(`Unhandled eventType: ${event.eventType}`);
  }
}

