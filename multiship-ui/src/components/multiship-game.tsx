import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { gameActions } from '@/features/game/game-slice';
import {
  CREATE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM,
  SIGNUP,
  START_GAME,
  SUBMIT_BOARD,
  TRY_HIT,
} from '@/ws/actions';
import { FLEET, canPlace, randomFleet, shipAt, shipCells, type Placements } from '@/lib/fleet';
import type { PlayerView, RoomView, ServerCellState, ShipState } from '@/types/multiship.types';
import type { CellState } from '@/components/game/RetroGridCell';
import type { PlacementShip } from '@/components/game/RetroShipPlacementGrid';
import {
  BoardSetupPage,
  GameOverPage,
  GameplayPage,
  LobbyPage,
  SignupPage,
  WaitingRoomPage,
} from '@/components/pages';

const AVATARS = ['💀', '⚔️', '🔥', '👹', '🐺', '🦇', '🏴‍☠️', '⚓'];

const emptyGrid = (): CellState[][] =>
  Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 'empty' as CellState));

const toCell = (state: ServerCellState | undefined): CellState =>
  state === 'HIT' ? 'hit' : state === 'MISS' ? 'miss' : 'empty';

function boardToCells(player: PlayerView, myShips?: ShipState[]): CellState[][] {
  const grid = emptyGrid();
  myShips?.forEach((ship) => shipCells(ship).forEach(([x, y]) => (grid[y][x] = 'ship')));
  player.board.forEach((row, y) =>
    row.forEach((state, x) => {
      if (state !== 'HIDDEN') grid[y][x] = toCell(state);
    }),
  );
  return grid;
}

function ErrorBanner() {
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.game.error);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => dispatch(gameActions.errorCleared()), 4000);
    return () => clearTimeout(t);
  }, [error, dispatch]);
  if (!error) return null;
  return (
    <div
      role="alert"
      onClick={() => dispatch(gameActions.errorCleared())}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 cursor-pointer border-4 border-black bg-[#FF0000] px-4 py-2 text-sm font-bold uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
    >
      {error}
    </div>
  );
}

function Signup() {
  const dispatch = useAppDispatch();
  const liveUsers = useAppSelector((s) => s.health.liveUsers);
  const { connected, pending, name: savedName, avatar: savedAvatar } = useAppSelector((s) => s.game);
  const [name, setName] = useState(savedName);
  const [avatar, setAvatar] = useState(savedAvatar || AVATARS[0]);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || !connected) return;
    dispatch(gameActions.signupRequested({ name: trimmed, avatar }));
    dispatch(SIGNUP({ email: '', name: trimmed, avatar }));
  };

  return (
    <SignupPage
      avatars={AVATARS.map((a) => ({ id: a, label: a }))}
      selectedAvatarId={avatar}
      username={name}
      onUsernameChange={setName}
      onAvatarSelect={setAvatar}
      onSubmit={submit}
      isLoading={pending || !connected}
      liveUsers={liveUsers}
    />
  );
}

function Lobby() {
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');

  return (
    <LobbyPage
      roomCode={code}
      onRoomCodeChange={setCode}
      onCreateRoom={() => {
        dispatch(gameActions.roomRequested());
        dispatch(CREATE_ROOM());
      }}
      onJoinRoom={() => {
        const roomCode = code.trim().toLowerCase();
        if (!roomCode) return;
        dispatch(gameActions.roomRequested());
        dispatch(JOIN_ROOM({ roomCode }));
      }}
    />
  );
}

function WaitingRoom({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const isHost = room.hostId === me;
  const enough = room.players.length >= 2;

  return (
    <WaitingRoomPage
      roomCode={room.code}
      maxPlayers={room.maxPlayers}
      isHost={isHost}
      canStart={enough}
      hint={
        isHost
          ? enough
            ? `Start now or wait for ${room.maxPlayers} captains (auto-start)`
            : 'Need at least 2 captains'
          : undefined
      }
      players={room.players.map((p) => ({
        id: p.sessionId,
        name: p.sessionId === me ? `${p.name} (you)` : p.name,
        avatar: p.avatar,
        isHost: p.isHost,
        isReady: true,
      }))}
      onStartGame={() => dispatch(START_GAME(room.roomId))}
      onLeave={() => dispatch(LEAVE_ROOM())}
      onCopyCode={() => navigator.clipboard?.writeText(room.code)}
    />
  );
}

function BoardSetup({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const { boardSubmitted, pending } = useAppSelector((s) => s.game);
  const [placements, setPlacements] = useState<Placements>({});
  const [selected, setSelected] = useState<string | undefined>(FLEET[0].id);
  const [horizontal, setHorizontal] = useState(true);

  const grid = useMemo(() => {
    const g = emptyGrid();
    Object.values(placements).forEach((ship) => shipCells(ship).forEach(([x, y]) => (g[y][x] = 'ship')));
    return g;
  }, [placements]);

  const ships: PlacementShip[] = FLEET.map((def) => ({
    id: def.id,
    name: def.name,
    length: def.length,
    isPlaced: Boolean(placements[def.id]),
    orientation: (placements[def.id]?.direction ?? (horizontal ? 'HORIZONTAL' : 'VERTICAL')) === 'HORIZONTAL'
      ? 'horizontal'
      : 'vertical',
  }));

  const nextUnplaced = (p: Placements) => FLEET.find((def) => !p[def.id])?.id;

  const place = (x: number, y: number) => {
    const existing = shipAt(placements, x, y);
    if (existing) {
      // Pick the ship back up.
      const rest = { ...placements };
      delete rest[existing];
      setPlacements(rest);
      setSelected(existing);
      return;
    }
    if (!selected) return;
    const def = FLEET.find((d) => d.id === selected)!;
    const ship: ShipState = { x, y, length: def.length, direction: horizontal ? 'HORIZONTAL' : 'VERTICAL' };
    const others = Object.entries(placements).filter(([id]) => id !== selected).map(([, s]) => s);
    if (!canPlace(ship, others)) {
      dispatch(gameActions.errorReceived({ msg: "Ship doesn't fit there" }));
      return;
    }
    const next = { ...placements, [selected]: ship };
    setPlacements(next);
    setSelected(nextUnplaced(next));
  };

  const pending_players = room.players.filter((p) => p.status !== 'BOARD_READY' && p.sessionId !== me);
  const statusText = boardSubmitted
    ? pending_players.length
      ? `Fleet locked in. Waiting for ${pending_players.map((p) => p.name).join(', ')}...`
      : 'Fleet locked in. Battle starting...'
    : 'Place all 10 ships, then hit Ready.';

  return (
    <BoardSetupPage
      ships={ships}
      selectedShipId={selected}
      grid={grid}
      onShipSelect={(id) => {
        if (placements[id]) {
          const rest = { ...placements };
          delete rest[id];
          setPlacements(rest);
        }
        setSelected(id);
      }}
      onShipPlace={place}
      onRotate={() => setHorizontal((h) => !h)}
      onReset={() => {
        setPlacements({});
        setSelected(FLEET[0].id);
      }}
      onRandomize={() => {
        setPlacements(randomFleet());
        setSelected(undefined);
      }}
      onReady={() => {
        if (pending) return;
        const fleet = FLEET.map((def) => placements[def.id]).filter(Boolean);
        if (fleet.length !== FLEET.length) return;
        dispatch(gameActions.boardSubmitRequested(fleet));
        dispatch(SUBMIT_BOARD({ roomId: room.roomId, ships: fleet }));
      }}
      isReady={boardSubmitted}
      statusText={statusText}
    />
  );
}

function Battle({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const { myShips, log, stats } = useAppSelector((s) => s.game);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const self = room.players.find((p) => p.sessionId === me);
  const opponents = room.players
    .filter((p) => p.sessionId !== me)
    .map((p) => ({
      id: p.sessionId,
      name: p.name,
      avatar: p.avatar,
      cells: boardToCells(p),
      shipsRemaining: p.shipsRemaining,
      isEliminated: p.eliminated,
    }));

  // Default to (and move off of) eliminated targets automatically.
  const selectedOpponent = opponents.find((o) => o.id === selectedId && !o.isEliminated)
    ?? opponents.find((o) => !o.isEliminated)
    ?? opponents[0];

  const isMyTurn = room.currentPlayer === me;
  const currentName = room.players.find((p) => p.sessionId === room.currentPlayer)?.name ?? '...';

  return (
    <GameplayPage
      playerBoard={self ? boardToCells(self, myShips) : emptyGrid()}
      opponents={opponents}
      selectedOpponentId={selectedOpponent?.id}
      onOpponentSelect={setSelectedId}
      onAttack={(x, y) => {
        if (!isMyTurn || !selectedOpponent || selectedOpponent.isEliminated) return;
        dispatch(TRY_HIT({ roomId: room.roomId, targetSessionId: selectedOpponent.id, x, y }));
      }}
      currentTurn={currentName}
      currentTurnId={room.currentPlayer}
      isMyTurn={isMyTurn}
      isSpectating={self?.eliminated}
      gameLog={log}
      myStatus={{ shipsRemaining: self?.shipsRemaining ?? 0, hits: stats.hits, misses: stats.misses }}
    />
  );
}

function GameOver({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((s) => s.game.stats);
  const winner = room.players.find((p) => p.sessionId === room.winnerId);
  const leave = () => dispatch(LEAVE_ROOM());

  return (
    <GameOverPage
      isWinner={room.winnerId === me}
      winnerName={winner?.name}
      stats={stats}
      onPlayAgain={leave}
      onMainMenu={leave}
    />
  );
}

export default function MultishipGame() {
  const { signedUp, sessionId, room } = useAppSelector((s) => s.game);

  let screen;
  if (!signedUp || !sessionId) {
    screen = <Signup />;
  } else if (!room) {
    screen = <Lobby />;
  } else {
    switch (room.status) {
      case 'BOARD_SELECTION':
      case 'PLAYERS_READY':
        screen = <BoardSetup key={room.roomId} room={room} me={sessionId} />;
        break;
      case 'ONGOING':
        screen = <Battle room={room} me={sessionId} />;
        break;
      case 'FINISHED':
        screen = <GameOver room={room} me={sessionId} />;
        break;
      default:
        screen = <WaitingRoom room={room} me={sessionId} />;
    }
  }

  return (
    <>
      <ErrorBanner />
      {screen}
    </>
  );
}
