import { useCategories, type Category, type CategoryKind } from '@/entities/category';
import { useTransactions } from '@/entities/transaction';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';

import { frequentCategoriesLimit } from './use-frequent-categories';

// Words shorter than this match almost every note by chance ("и", "на", "с") and would
// dominate the score without carrying any real signal.
const minWordLength = 3;
// Recomputing the letter-overlap score against the full note history on every keystroke is
// wasted work while the user is still typing.
const debounceInMs = 300;
// An exact repeat of the same word is the strongest possible signal (the user typed the
// literal same word before) — worth twice a same-letters-different-word partial match.
const exactWordMatchMultiplier = 2;
// Only auto-pick a category when it's not a close call — otherwise just reorder the list and
// let the user tap, per the "smart default, never the only option" rule (ux-guidelines.md, I).
const autoSelectMinScoreRatio = 2;
// Scoring against the full transaction history has no upper bound on a years-old, heavily-used
// ledger — cap the scan to the most recent transactions (useTransactions() is already sorted
// newest-first) rather than a day-window, since an exact note match doesn't go stale with time
// the way usage frequency does (see ux-guidelines.md, I).
const noteMatchHistoryLimit = 500;

export function tokenizeNote(note: string): string[] {
  const words = note.toLowerCase().match(/\p{L}+/gu) ?? [];
  return words.filter((word) => word.length >= minWordLength);
}

function countLetters(word: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of word) {
    counts.set(letter, (counts.get(letter) ?? 0) + 1);
  }
  return counts;
}

export function scoreWordPair(wordA: string, wordB: string): number {
  const lettersA = countLetters(wordA);
  const lettersB = countLetters(wordB);
  let overlap = 0;
  for (const [letter, countA] of lettersA) {
    overlap += Math.min(countA, lettersB.get(letter) ?? 0);
  }
  return wordA === wordB ? overlap * exactWordMatchMultiplier : overlap;
}

export function scoreNoteMatch(noteWords: string[], historicalWords: string[]): number {
  let total = 0;
  for (const noteWord of noteWords) {
    let bestForWord = 0;
    for (const historicalWord of historicalWords) {
      bestForWord = Math.max(bestForWord, scoreWordPair(noteWord, historicalWord));
    }
    total += bestForWord;
  }
  return total;
}

export interface NoteRelevantCategories {
  // Categories with at least one scored match, most relevant first. Empty until the (debounced)
  // note has enough real words to score against.
  categories: Category[];
  // Set only when the top category's score is unambiguously ahead of the runner-up.
  autoSelectCategoryId: string | undefined;
}

export function useNoteRelevantCategories(kind: CategoryKind, note: string): NoteRelevantCategories {
  const debouncedNote = useDebouncedValue(note, debounceInMs);
  const categories = useCategories(kind);
  const transactions = useTransactions();

  const noteWords = tokenizeNote(debouncedNote);
  if (noteWords.length === 0) {
    return { categories: [], autoSelectCategoryId: undefined };
  }

  const scoreByCategoryId = new Map<string, number>();
  for (const transaction of transactions.slice(0, noteMatchHistoryLimit)) {
    if (transaction.type !== kind || !transaction.note) {
      continue;
    }
    const historicalWords = tokenizeNote(transaction.note);
    if (historicalWords.length === 0) {
      continue;
    }
    const score = scoreNoteMatch(noteWords, historicalWords);
    if (score <= 0) {
      continue;
    }
    scoreByCategoryId.set(transaction.categoryId, (scoreByCategoryId.get(transaction.categoryId) ?? 0) + score);
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const ranked = [...scoreByCategoryId.entries()]
    .map(([categoryId, score]) => ({ category: categoryById.get(categoryId), score }))
    .filter((entry): entry is { category: Category; score: number } => entry.category !== undefined)
    .sort((a, b) => b.score - a.score)
    .slice(0, frequentCategoriesLimit);

  const [top, runnerUp] = ranked;
  const autoSelectCategoryId =
    top && (!runnerUp || top.score >= runnerUp.score * autoSelectMinScoreRatio) ? top.category.id : undefined;

  return {
    categories: ranked.map((entry) => entry.category),
    autoSelectCategoryId,
  };
}
