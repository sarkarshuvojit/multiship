import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { gameActions } from '@/features/game/game-slice';
import { LEAVE_ROOM } from '@/ws/actions';
import { isMuted, setMuted, sfx } from '@/lib/sfx';
import { cn } from '@/lib/utils';
import { Button, Logo } from './ui';
import { Toaster } from './toast';
import { toast } from './toast-bus';
import { normalizeCode } from './constants';
import { Home } from './screens/Home';
import { Lobby } from './screens/Lobby';
import { Setup } from './screens/Setup';
import { Battle } from './screens/Battle';

/** Sounds, toasts and tab-title cues driven by game state. */
function useGameFeedback() {
  const dispatch = useAppDispatch();
  const { room, sessionId, lastShot, log, error } = useAppSelector((s) => s.game);
  const seenLog = useRef<string | null>(null);
  const prevTurn = useRef<string | null>(null);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    if (!lastShot) return;
    if (lastShot.hit) sfx.hit();
    else sfx.miss();
  }, [lastShot]);

  useEffect(() => {
    const last = log[log.length - 1];
    if (!last || last.id === seenLog.current) return;
    seenLog.current = last.id;
    if (last.type === 'sunk') {
      sfx.sunk();
      toast(`💥 ${last.message}`, 'gold');
    } else if (last.type === 'error') {
      toast(last.message, 'hit');
    }
  }, [log]);

  useEffect(() => {
    const turn = room?.status === 'ONGOING' ? room.currentPlayer : null;
    if (turn && turn === sessionId && prevTurn.current !== turn) sfx.turn();
    prevTurn.current = turn;
    document.title = turn && turn === sessionId ? '🎯 Your turn — Multiship' : 'Multiship';
  }, [room?.status, room?.currentPlayer, sessionId]);

  useEffect(() => {
    if (room?.status === 'FINISHED' && prevStatus.current !== 'FINISHED') {
      if (room.winnerId === sessionId) sfx.win();
      else sfx.lose();
    }
    prevStatus.current = room?.status ?? null;
  }, [room?.status, room?.winnerId, sessionId]);

  useEffect(() => {
    if (!error) return;
    toast(error, 'error');
    dispatch(gameActions.errorCleared());
  }, [error, dispatch]);
}

function TopBar() {
  const dispatch = useAppDispatch();
  const room = useAppSelector((s) => s.game.room);
  const connected = useAppSelector((s) => s.game.connected);
  const [muted, setMutedState] = useState(isMuted());
  const [confirmLeave, setConfirmLeave] = useState(false);
  const inBattle = room?.status === 'ONGOING';

  useEffect(() => {
    if (!confirmLeave) return;
    const t = setTimeout(() => setConfirmLeave(false), 3000);
    return () => clearTimeout(t);
  }, [confirmLeave]);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-line bg-abyss/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo className="text-white" />
        <div className="flex items-center gap-1">
          {!connected && <span className="mr-2 text-xs text-gold">Reconnecting…</span>}
          <Button
            variant="ghost"
            size="sm"
            aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
            title={muted ? 'Unmute' : 'Mute'}
            onClick={() => {
              setMuted(!muted);
              setMutedState(!muted);
            }}
          >
            {muted ? '🔇' : '🔊'}
          </Button>
          {room && room.status !== 'FINISHED' && (
            <Button
              variant={confirmLeave ? 'danger' : 'ghost'}
              size="sm"
              onClick={() => {
                if (!confirmLeave) return setConfirmLeave(true);
                setConfirmLeave(false);
                dispatch(LEAVE_ROOM());
              }}
            >
              {confirmLeave ? (inBattle ? 'Forfeit?' : 'Leave?') : inBattle ? 'Forfeit' : 'Leave'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default function GameApp() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { signedUp, sessionId, room } = useAppSelector((s) => s.game);
  const inviteCode = code ? normalizeCode(code) : undefined;

  useGameFeedback();

  // Drop the invite from the URL once we're in a room so "Home" later is clean.
  useEffect(() => {
    if (room && code) navigate('/', { replace: true });
  }, [room, code, navigate]);

  let screen;
  if (!signedUp || !sessionId || !room) {
    screen = <Home inviteCode={inviteCode} />;
  } else if (room.status === 'BOARD_SELECTION' || room.status === 'PLAYERS_READY') {
    screen = <Setup key={room.roomId} room={room} me={sessionId} />;
  } else if (room.status === 'ONGOING' || room.status === 'FINISHED') {
    screen = <Battle room={room} me={sessionId} />;
  } else {
    screen = <Lobby room={room} me={sessionId} />;
  }

  return (
    <div className={cn('min-h-screen pb-[env(safe-area-inset-bottom)]')}>
      <TopBar />
      <main key={room?.status ?? 'home'} className="animate-rise">
        {screen}
      </main>
      <Toaster />
    </div>
  );
}
