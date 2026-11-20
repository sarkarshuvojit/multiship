export const AVATARS = ['🦈', '🐙', '🐳', '🦑', '🐬', '🦀', '🏴‍☠️', '⚓', '🧜', '🦜'];

export const SHIP_NAMES: Record<number, string> = {
  4: 'Battleship',
  3: 'Cruiser',
  2: 'Destroyer',
  1: 'Submarine',
};

export const FLEET_SIZE = 10;

/** Lowercase, letters only, auto-insert dashes: "ABCdefGHI" -> "abc-def-ghi". */
export function normalizeCode(raw: string): string {
  const letters = raw.toLowerCase().replace(/[^a-z]/g, '').slice(0, 9);
  return letters.match(/.{1,3}/g)?.join('-') ?? '';
}

export function inviteLink(code: string): string {
  return `${window.location.origin}${window.location.pathname}#/join/${code}`;
}
