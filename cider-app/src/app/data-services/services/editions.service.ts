import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { Edition } from '../types/edition.type';
import { FieldType } from '../types/field-type.type';
import { DecksService } from './decks.service';

@Injectable({
  providedIn: 'root'
})
export class EditionsService extends DecksChildService<Edition, number> {

  constructor(decksService: DecksService, db: AppDB) {
    super(decksService, db, AppDB.EDITIONS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'deckId', header: 'Deck ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, required: true},
      {field: 'description', header: 'Description', type: FieldType.textArea},
      {field: 'color', header: 'Color', type: FieldType.text,
        description: 'Hex color used to tint the edition badge (e.g. #ffaa00)'},
      {field: 'icon', header: 'Icon', type: FieldType.text,
        description: 'PrimeIcons class name (e.g. pi-star)'},
      {field: 'order', header: 'Order', type: FieldType.number,
        description: 'Sort order within the deck (lower comes first)'},
      {field: 'releaseDate', header: 'Release Date', type: FieldType.text}
    ]);
  }

  override getEntityName(entity: Edition) {
    return entity.name;
  }
}
