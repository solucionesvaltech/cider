import { EntityField } from '../../data-services/types/entity-field.type';
import { FieldType } from '../../data-services/types/field-type.type';
import { computeTokenStats } from './token-stats.util';

interface FakeCard { id: number; name: string; count?: number; rules?: string; }

const nameField: EntityField<FakeCard> = { field: 'name', header: 'Name', type: FieldType.text };
const rulesField: EntityField<FakeCard> = { field: 'rules', header: 'Rules', type: FieldType.textArea };

describe('computeTokenStats', () => {
  it('counts unique tokens once per record but accumulates copies', () => {
    const records: FakeCard[] = [
      { id: 1, name: 'Fire Bolt', count: 3, rules: 'Deal 2 damage' },
      { id: 2, name: 'Fire Wall', count: 1, rules: 'Block damage' }
    ];
    const [nameStat] = computeTokenStats([nameField, rulesField], records, 20);
    const fire = nameStat.tokens.find(t => t.token === 'Fire');
    expect(fire?.count).toBe(2);
    expect(fire?.copiesCount).toBe(4); // 3 + 1
  });

  it('treats records with missing count as a single copy', () => {
    const records: FakeCard[] = [{ id: 1, name: 'Mystery' }];
    const [stat] = computeTokenStats([nameField], records, 20);
    expect(stat.tokens[0].copiesCount).toBe(1);
  });

  it('skips hidden fields and respects topPerField cap', () => {
    const hiddenField: EntityField<FakeCard> = {
      field: 'rules', header: 'Rules', type: FieldType.text, hidden: true
    };
    const records: FakeCard[] = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Token${i}` }));
    const stats = computeTokenStats([nameField, hiddenField], records, 5);
    expect(stats.length).toBe(1);
    expect(stats[0].tokens.length).toBeLessThanOrEqual(5);
  });

  it('strips html tags, quotes, commas and periods before tokenising', () => {
    const records: FakeCard[] = [{ id: 1, name: '<b>Hello</b>, "world".' }];
    const [stat] = computeTokenStats([nameField], records, 20);
    const tokens = stat.tokens.map(t => t.token);
    expect(tokens).toContain('Hello');
    expect(tokens).toContain('world');
  });
});
