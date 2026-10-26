import data from './data/words_cut.json';

export type Word = { i: number; word: string; start: number; end: number };
export const WORDS: Word[] = (data as any).words;
export const OUT_TOTAL: number = (data as any).out_total;

export type Line = { words: Word[]; start: number; end: number };

// group words into caption lines of <=maxWords, breaking on sentence-final punct
export function buildLines(maxWords = 3): Line[] {
  const lines: Line[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) {
      lines.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end });
      cur = [];
    }
  };
  for (const w of WORDS) {
    cur.push(w);
    const endsSentence = /[.?!:]$/.test(w.word);
    if (cur.length >= maxWords || endsSentence) flush();
  }
  flush();
  return lines;
}

// active line at time t = the line currently being spoken (latest one started).
// lines are sorted by start, so pick the last line whose start <= t (+ small lead).
export function activeLine(lines: Line[], t: number): Line | null {
  let cur: Line | null = null;
  for (const l of lines) {
    if (l.start <= t + 0.08) cur = l;
    else break;
  }
  return cur;
}

// words spoken within [a,b)
export function wordsInRange(a: number, b: number): Word[] {
  return WORDS.filter((w) => w.start >= a - 0.001 && w.start < b);
}
export function firstWordAt(sub: string, after = 0): Word | undefined {
  return WORDS.find(
    (w) => w.start >= after && w.word.toLowerCase().replace(/[^a-z']/g, '').startsWith(sub)
  );
}
