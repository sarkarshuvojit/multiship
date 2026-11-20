import { useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { START_GAME } from '@/ws/actions';
import { cn } from '@/lib/utils';
import type { RoomView } from '@/types/multiship.types';
import { Avatar, Button, Chip, Panel } from '../ui';
import { inviteLink } from '../constants';
import { toast } from '../toast-bus';

export function Lobby({ room, me }: { room: RoomView; me: string }) {
  const dispatch = useAppDispatch();
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const isHost = room.hostId === me;
  const host = room.players.find((p) => p.isHost);
  const canStart = room.players.length >= 2;
  const link = inviteLink(room.code);

  const copy = async (what: 'link' | 'code') => {
    const text = what === 'link' ? link : room.code;
    try {
      if (what === 'link' && navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: 'Join my Multiship battle', url: link });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(what);
      toast(what === 'link' ? 'Invite link copied' : 'Room code copied', 'ok');
      setTimeout(() => setCopied(null), 1800);
    } catch {
      toast(text, 'info');
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-14">
      <div className="text-center">
        <Chip tone="accent">Lobby</Chip>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Gather your rivals</h1>
        <p className="mt-2 text-slate-400">Send the link — they land straight in this room.</p>
      </div>

      <Panel className="mt-8 p-5 sm:p-6">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => copy('code')}
            className="group flex flex-1 items-center justify-between rounded-xl bg-deep px-4 py-3 ring-1 ring-line transition hover:ring-accent/50"
            title="Copy code"
          >
            <span>
              <span className="block text-left text-[11px] uppercase tracking-wider text-slate-500">Room code</span>
              <span className="font-mono text-2xl font-medium tracking-[0.15em] text-white">{room.code.toUpperCase()}</span>
            </span>
            <span className="text-sm text-slate-500 group-hover:text-accent">{copied === 'code' ? '✓' : 'Copy'}</span>
          </button>
          <Button size="lg" onClick={() => copy('link')} className="sm:w-auto">
            {copied === 'link' ? '✓ Copied' : '🔗 Copy invite link'}
          </Button>
        </div>
      </Panel>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: room.maxPlayers }, (_, i) => {
          const p = room.players[i];
          return (
            <div
              key={p?.sessionId ?? `empty-${i}`}
              className={cn(
                'flex items-center gap-3 rounded-2xl p-4 sm:flex-col sm:py-6 sm:text-center',
                p ? 'bg-panel ring-1 ring-line animate-rise' : 'border-2 border-dashed border-line',
              )}
            >
              {p ? (
                <>
                  <Avatar emoji={p.avatar} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {p.name}
                      {p.sessionId === me && <span className="text-slate-500"> (you)</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{p.isHost ? 'Host' : 'Ready to sail'}</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="grid size-16 place-items-center rounded-full bg-white/[0.03] text-2xl text-slate-600">
                    <span className="animate-pulse">⋯</span>
                  </span>
                  <p className="text-sm text-slate-500">Open seat</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        {isHost ? (
          <>
            <Button size="lg" className="w-full sm:w-72" disabled={!canStart} onClick={() => dispatch(START_GAME(room.roomId))}>
              {canStart ? `Start with ${room.players.length} players` : 'Waiting for a rival…'}
            </Button>
            <p className="text-xs text-slate-500">
              {canStart ? `Or wait — it starts automatically at ${room.maxPlayers}.` : 'You need at least one opponent.'}
            </p>
          </>
        ) : (
          <p className="flex items-center gap-2 text-slate-400">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            Waiting for {host?.name ?? 'the host'} to start…
          </p>
        )}
      </div>
    </div>
  );
}
