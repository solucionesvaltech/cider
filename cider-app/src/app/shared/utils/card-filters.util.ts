import { Card } from '../../data-services/types/card.type';
import { Edition } from '../../data-services/types/edition.type';

export const NO_EDITION_KEY = '__none__';
export const NO_EDITION_LABEL = 'Sin edición';

export type CardSortBy = 'edition' | 'name' | 'none';

export interface CardFilterState {
  query: string;
  selectedEditionIds: (number | string)[];
  sortBy: CardSortBy;
}

export interface EditionGroup {
  key: string;
  edition: Edition | null;
  cards: Card[];
}

export function defaultCardFilterState(): CardFilterState {
  return { query: '', selectedEditionIds: [], sortBy: 'edition' };
}

export function filterCards(cards: Card[], state: CardFilterState): Card[] {
  const q = state.query.trim().toLowerCase();
  const selected = state.selectedEditionIds && state.selectedEditionIds.length > 0
    ? new Set(state.selectedEditionIds.map(v => '' + v))
    : null;
  return cards.filter(card => {
    if (q && !JSON.stringify(card).toLowerCase().includes(q)) {
      return false;
    }
    if (selected) {
      const key = card.editionId == null ? NO_EDITION_KEY : '' + card.editionId;
      if (!selected.has(key)) {
        return false;
      }
    }
    return true;
  });
}

export function groupByEdition(cards: Card[], editions: Edition[]): EditionGroup[] {
  const sortedEditions = [...editions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const byEdition = new Map<string, Card[]>();
  cards.forEach(card => {
    const key = card.editionId == null ? NO_EDITION_KEY : '' + card.editionId;
    if (!byEdition.has(key)) byEdition.set(key, []);
    byEdition.get(key)!.push(card);
  });
  const orderedKeys = sortedEditions
    .map(e => '' + e.id)
    .filter(k => byEdition.has(k));
  if (byEdition.has(NO_EDITION_KEY)) orderedKeys.push(NO_EDITION_KEY);
  return orderedKeys.map(key => ({
    key,
    edition: key === NO_EDITION_KEY ? null : sortedEditions.find(e => '' + e.id === key) ?? null,
    cards: byEdition.get(key)!.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }));
}

/**
 * Filter + sort/group + flatten — the canonical pipeline used by both
 * the Card Viewer and the Card Thumbnails pages so they always show
 * the same cards in the same order given the same filter state.
 */
export function applyFilterPipeline(
  cards: Card[], editions: Edition[], state: CardFilterState
): { groups: EditionGroup[]; flat: Card[] } {
  const filtered = filterCards(cards, state);
  if (state.sortBy === 'name') {
    const sorted = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return { groups: [{ key: 'all', edition: null, cards: sorted }], flat: sorted };
  }
  if (state.sortBy === 'none') {
    return { groups: [{ key: 'all', edition: null, cards: filtered }], flat: filtered };
  }
  const groups = groupByEdition(filtered, editions);
  return { groups, flat: groups.flatMap(g => g.cards) };
}
