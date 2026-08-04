export const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
} as const;

export type CharsetName = keyof typeof CHARSETS;

export type PasswordOptions = {
  readonly length: number;
  readonly charsets: readonly CharsetName[];
};

/** Returns a cryptographically secure random integer in [0, maxExclusive) without modulo bias. */
function secureRandomInt(maxExclusive: number): number {
  const range = 2 ** 32;
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % maxExclusive;
}

function randomChar(pool: string): string {
  return pool.charAt(secureRandomInt(pool.length));
}

/** Fisher–Yates shuffle backed by a secure random source. */
function secureShuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/**
 * Generates a random password that contains at least one character
 * from every selected charset (as long as the length allows it).
 */
export function generatePassword({length, charsets}: PasswordOptions): string {
  const pool = charsets.map((name) => CHARSETS[name]).join('');
  if (pool.length === 0 || length <= 0) {
    return '';
  }
  const required = charsets.slice(0, length).map((name) => randomChar(CHARSETS[name]));
  const filler = Array.from({length: length - required.length}, () => randomChar(pool));
  return secureShuffle([...required, ...filler]).join('');
}
