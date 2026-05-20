import { DecksService } from '../services/decks.service';
import { EntityField } from '../types/entity-field.type';
import { AppDB } from './db';
import { ParentScopedService } from './parent-scoped.service';

/**
 * Thin specialisation of ParentScopedService that wires the parent
 * observable to the currently-selected Deck and the foreign-key field
 * to "deckId". Kept for source-compat with existing services
 * (CardsService, CardTemplatesService, …) that extend it directly.
 */
export class DecksChildService<Entity, Identity extends string | number>
  extends ParentScopedService<Entity, Identity, number> {

  decksService: DecksService;

  constructor(decksService: DecksService, db: AppDB, tableName: string, fields?: EntityField<Entity>[]) {
    super(db, tableName, decksService.getSelectedDeck(), 'deckId', fields);
    this.decksService = decksService;
  }
}
