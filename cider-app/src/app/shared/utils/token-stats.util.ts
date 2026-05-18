import { EntityField } from '../../data-services/types/entity-field.type';
import { TableStat, TokenStat } from '../../entity-table/table-stat.type';

/**
 * Tokenise every (visible) field of every record and count how many
 * times each token appears, optionally weighting by the record's
 * "count" column (how many copies of the card live in the deck).
 *
 * This is the same calculation that EntityTableComponent had inline
 * for its "View Stats" dialog — lifted into a util so the deck-stats
 * page can reuse it and the entity-table can delegate.
 */
export function computeTokenStats<Entity>(
  fields: EntityField<Entity>[],
  records: Entity[],
  topPerField = 20
): TableStat[] {
  return fields
    .filter(field => !field.hidden)
    .map(field => {
      const tokenStats = new Map<string, TokenStat>();
      records.forEach(record => {
        const copies = Number((record as any)['count'] || 1);
        const value = (record as any)[field.field];
        if (value === undefined || value === null || value === '') {
          return;
        }
        const text = '' + value;
        const tokens = text
          .replace(/[<][^>]*[>]|["'.,]/g, '')
          .split(/ |\n|\r/)
          .filter(t => t);
        tokens.forEach(token => {
          const existing = tokenStats.get(token);
          if (existing) {
            tokenStats.set(token, {
              token,
              count: existing.count + 1,
              copiesCount: existing.copiesCount + copies
            });
          } else if (tokenStats.size < topPerField) {
            tokenStats.set(token, { token, count: 1, copiesCount: copies });
          }
        });
      });
      return {
        header: field.header,
        tokens: Array.from(tokenStats.values()).sort((a, b) => b.count - a.count)
      } as TableStat;
    });
}
