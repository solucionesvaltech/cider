import { Component, OnInit } from '@angular/core';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardsService } from '../data-services/services/cards.service';
import { EditionsService } from '../data-services/services/editions.service';
import { Card } from '../data-services/types/card.type';
import { CardAttribute } from '../data-services/types/card-attribute.type';
import { Edition } from '../data-services/types/edition.type';
import { EntityField } from '../data-services/types/entity-field.type';
import { FieldType } from '../data-services/types/field-type.type';
import { computeTokenStats } from '../shared/utils/token-stats.util';

interface ChartDatum { name: string; value: number; }

@Component({
  selector: 'app-deck-stats',
  templateUrl: './deck-stats.component.html',
  styleUrls: ['./deck-stats.component.scss']
})
export class DeckStatsComponent implements OnInit {
  cards: Card[] = [];
  attributes: CardAttribute[] = [];
  editions: Edition[] = [];

  totalCards = 0;
  totalCopies = 0;
  uniqueNames = 0;

  countByEdition: ChartDatum[] = [];
  countByAttributeField: string | null = null;
  attributeFields: { label: string; value: string; options?: string[] }[] = [];
  countByAttribute: ChartDatum[] = [];
  copiesHistogram: ChartDatum[] = [];
  topTokensField: string | null = null;
  topTokens: ChartDatum[] = [];

  colorScheme: any = {
    domain: ['#5b8def', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
             '#ec4899', '#14b8a6', '#fb923c', '#a78bfa', '#22c55e']
  };

  constructor(
    private cardsService: CardsService,
    private attributesService: CardAttributesService,
    private editionsService: EditionsService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadAll();
  }

  private async loadAll(): Promise<void> {
    [this.cards, this.attributes, this.editions] = await Promise.all([
      this.cardsService.getAll(),
      this.attributesService.getAll(),
      this.editionsService.getAll()
    ]);

    this.totalCards = this.cards.length;
    this.totalCopies = this.cards.reduce((sum, c) => sum + (Number(c.count) || 1), 0);
    this.uniqueNames = new Set(this.cards.map(c => (c.name || '').trim().toLowerCase())).size;

    this.buildEditionChart();
    this.buildCopiesHistogram();
    this.buildAttributeFields();

    if (this.attributeFields.length > 0) {
      this.countByAttributeField = this.attributeFields[0].value;
      this.recomputeAttributeChart();
    }
    if (this.attributes.length > 0) {
      const firstText = this.attributes.find(a => a.type === FieldType.text || a.type === FieldType.textArea);
      this.topTokensField = firstText ? this.fieldName(firstText) : 'name';
      this.recomputeTokenChart();
    } else {
      this.topTokensField = 'name';
      this.recomputeTokenChart();
    }
  }

  private fieldName(attribute: CardAttribute): string {
    return ('' + attribute.name).trim().replace(/ /g, '-').toLowerCase();
  }

  private buildEditionChart(): void {
    const counts = new Map<string, number>();
    const labelById = new Map<number, string>(this.editions.map(e => [e.id, e.name]));
    this.cards.forEach(card => {
      const copies = Number(card.count) || 1;
      const label = card.editionId == null
        ? 'Sin edición'
        : (labelById.get(card.editionId) || `Edition ${card.editionId}`);
      counts.set(label, (counts.get(label) || 0) + copies);
    });
    this.countByEdition = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  private buildCopiesHistogram(): void {
    const buckets = new Map<number, number>();
    this.cards.forEach(card => {
      const c = Number(card.count) || 1;
      buckets.set(c, (buckets.get(c) || 0) + 1);
    });
    this.copiesHistogram = Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([copies, n]) => ({ name: `${copies}x`, value: n }));
  }

  private buildAttributeFields(): void {
    this.attributeFields = this.attributes
      .filter(a => a.type === FieldType.option || a.type === FieldType.number || a.type === FieldType.text)
      .map(a => ({ label: a.name, value: this.fieldName(a), options: a.options }));
  }

  recomputeAttributeChart(): void {
    if (!this.countByAttributeField) {
      this.countByAttribute = [];
      return;
    }
    const field = this.countByAttributeField;
    const counts = new Map<string, number>();
    this.cards.forEach(card => {
      const copies = Number(card.count) || 1;
      const raw = (card as any)[field];
      const label = (raw === undefined || raw === null || raw === '')
        ? '(empty)'
        : '' + raw;
      counts.set(label, (counts.get(label) || 0) + copies);
    });
    this.countByAttribute = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }

  recomputeTokenChart(): void {
    if (!this.topTokensField) {
      this.topTokens = [];
      return;
    }
    const field = this.topTokensField;
    const fakeField: EntityField<Card> = {
      field: field as any,
      header: field,
      type: FieldType.text
    };
    const [stats] = computeTokenStats([fakeField], this.cards, 12);
    this.topTokens = (stats?.tokens || []).map(t => ({ name: t.token, value: t.copiesCount }));
  }
}
