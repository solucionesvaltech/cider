import { firstValueFrom, Observable } from 'rxjs';
import { EntityField } from '../types/entity-field.type';
import { SearchParameters } from '../types/search-parameters.type';
import { AppDB } from './db';
import { IndexedDbService } from './indexed-db.service';

/**
 * Generalises the deck-child pattern: an entity collection scoped to a
 * parent record (resolved through an Observable of "the selected parent").
 * The parent's id is automatically applied as an equality filter on reads
 * and stamped on writes via a configurable foreign-key field.
 *
 * Concrete subclasses pick the parent service (decks or projects) and the
 * foreign-key field name (deckId, projectId, …).
 */
export class ParentScopedService<Entity, Identity extends string | number, ParentId>
  extends IndexedDbService<Entity, Identity> {

  constructor(
    db: AppDB,
    tableName: string,
    private parentSelected$: Observable<{ id?: ParentId } | undefined>,
    private parentForeignKey: string,
    fields?: EntityField<Entity>[]
  ) {
    super(db, tableName, fields);
  }

  private async parentCriteria(extra?: { [k: string]: any }): Promise<{ [k: string]: any }> {
    const parent = await firstValueFrom(this.parentSelected$);
    return { [this.parentForeignKey]: (parent || {} as any).id, ...(extra || {}) };
  }

  override async search(searchParameters: SearchParameters, equalityCriterias?: { [k: string]: any }) {
    return super.search(searchParameters, await this.parentCriteria(equalityCriterias));
  }

  override async getAll(equalityCriterias?: { [k: string]: any }) {
    return super.getAll(await this.parentCriteria(equalityCriterias));
  }

  override async create(entity: Entity, overrideParent?: boolean): Promise<Entity> {
    if (!overrideParent) {
      const parent = await firstValueFrom(this.parentSelected$);
      (entity as any)[this.parentForeignKey] = (parent || {} as any).id;
    }
    return super.create(entity);
  }

  override async update(id: Identity, entity: Entity): Promise<Entity> {
    const parent = await firstValueFrom(this.parentSelected$);
    (entity as any)[this.parentForeignKey] = (parent || {} as any).id;
    return super.update(id, entity);
  }

  override async deleteAll(equalityCriterias?: { [k: string]: any }): Promise<boolean> {
    return super.deleteAll(await this.parentCriteria(equalityCriterias));
  }
}
