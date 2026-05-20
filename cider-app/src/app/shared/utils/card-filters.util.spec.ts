import { Card } from '../../data-services/types/card.type';
import { Edition } from '../../data-services/types/edition.type';
import {
  NO_EDITION_KEY, applyFilterPipeline, defaultCardFilterState, filterCards, groupByEdition
} from './card-filters.util';

const card = (id: number, name: string, editionId?: number): Card => ({
  id, name, count: 1, frontCardTemplateId: 0, backCardTemplateId: 0, editionId
});
const edition = (id: number, name: string, order = 0): Edition => ({ id, deckId: 1, name, order });

describe('card-filters.util', () => {
  const cards: Card[] = [
    card(1, 'Fire Bolt', 100),
    card(2, 'Water Blade', 200),
    card(3, 'Mystery'),
    card(4, 'Fire Wall', 100)
  ];
  const editions: Edition[] = [edition(100, 'Spells', 1), edition(200, 'Weapons', 2)];

  describe('filterCards', () => {
    it('returns every card when filter is empty', () => {
      expect(filterCards(cards, defaultCardFilterState()).length).toBe(4);
    });

    it('matches the query against any field via JSON contains', () => {
      const out = filterCards(cards, { ...defaultCardFilterState(), query: 'fire' });
      expect(out.map(c => c.id).sort()).toEqual([1, 4]);
    });

    it('filters by selected edition ids, with NO_EDITION_KEY for cards without one', () => {
      const out = filterCards(cards, {
        ...defaultCardFilterState(), selectedEditionIds: [NO_EDITION_KEY]
      });
      expect(out.length).toBe(1);
      expect(out[0].id).toBe(3);
    });

    it('combines query and edition filters with AND', () => {
      const out = filterCards(cards, {
        ...defaultCardFilterState(), query: 'fire', selectedEditionIds: [100]
      });
      expect(out.length).toBe(2);
    });
  });

  describe('groupByEdition', () => {
    it('orders groups by Edition.order then puts NO_EDITION last', () => {
      const groups = groupByEdition(cards, editions);
      expect(groups.map(g => g.key)).toEqual(['100', '200', NO_EDITION_KEY]);
    });

    it('sorts cards within a group alphabetically by name', () => {
      const groups = groupByEdition(cards, editions);
      const spells = groups.find(g => g.key === '100')!;
      expect(spells.cards.map(c => c.name)).toEqual(['Fire Bolt', 'Fire Wall']);
    });

    it('returns no group for editions with no matching cards', () => {
      const groups = groupByEdition([cards[2]], editions);
      expect(groups.length).toBe(1);
      expect(groups[0].key).toBe(NO_EDITION_KEY);
    });
  });

  describe('applyFilterPipeline', () => {
    it('flat list when sortBy=name is a single global alphabetical group', () => {
      const { groups, flat } = applyFilterPipeline(cards, editions, {
        ...defaultCardFilterState(), sortBy: 'name'
      });
      expect(groups.length).toBe(1);
      expect(flat.map(c => c.name)).toEqual(['Fire Bolt', 'Fire Wall', 'Mystery', 'Water Blade']);
    });

    it('flat list mirrors groups order when sortBy=edition', () => {
      const { flat } = applyFilterPipeline(cards, editions, defaultCardFilterState());
      expect(flat.map(c => c.id)).toEqual([1, 4, 2, 3]);
    });

    it('sortBy=none preserves the input order after filtering', () => {
      const { flat } = applyFilterPipeline(cards, editions, {
        ...defaultCardFilterState(), sortBy: 'none', query: 'fire'
      });
      expect(flat.map(c => c.id)).toEqual([1, 4]);
    });
  });
});
