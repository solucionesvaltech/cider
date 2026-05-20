import { Component, OnInit, ViewChild } from '@angular/core';
import { DataView } from 'primeng/dataview';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { EditionsService } from '../data-services/services/editions.service';
import { Card } from '../data-services/types/card.type';
import { Edition } from '../data-services/types/edition.type';
import {
  CardFilterState, CardSortBy, applyFilterPipeline, defaultCardFilterState
} from '../shared/utils/card-filters.util';

@Component({
  selector: 'app-card-thumbnails',
  templateUrl: './card-thumbnails.component.html',
  styleUrls: ['./card-thumbnails.component.scss']
})
export class CardThumbnailsComponent implements OnInit {
  @ViewChild('dv') dv!: DataView;
  cards: Card[] = [];
  editions: Edition[] = [];
  thumbnailCards: Card[] = [];
  zoomLevel: number = 0.3;
  zoomOptions: any[] = [
    { label: 's', value: 0.2 },
    { label: 'm', value: 0.3 },
    { label: 'l', value: 0.5 },
    { label: 'xl', value: 0.8 }
  ];
  sideSelected: string = 'fronts';
  sideOptions: any[] = [
    { label: 'Fronts', value: 'fronts' },
    { label: 'Backs', value: 'backs' },
    { label: 'Both', value: 'both' }
  ];
  filterFields: string = "";
  copyOptions: any[] = [
    { label: 'Singles', value: 'singles' },
    { label: 'Copies', value: 'copies' }
  ];
  copySelected: string = 'copies';

  sortOptions: { label: string; value: CardSortBy }[] = [
    { label: 'By edition', value: 'edition' },
    { label: 'By name', value: 'name' },
    { label: 'Natural', value: 'none' }
  ];
  filterState: CardFilterState = defaultCardFilterState();

  constructor(public cardsService: CardsService,
    public templatesService: CardTemplatesService,
    private editionsService: EditionsService) { }

  async ngOnInit(): Promise<void> {
    const [cards, editions, fields] = await Promise.all([
      this.cardsService.getAll(),
      this.editionsService.getAll(),
      this.cardsService.getFields()
    ]);
    this.cards = cards;
    this.editions = editions;
    this.filterFields = fields.map(f => f.field).join(',');
    this.recomputeThumbnails();
  }

  recomputeThumbnails(): void {
    const { flat } = applyFilterPipeline(this.cards, this.editions, this.filterState);
    const expanded: Card[] = [];
    flat.forEach(card => {
      if (this.copySelected === 'singles') {
        expanded.push(card);
      } else {
        for (let i = 0; i < (typeof card.count === 'undefined' ? 1 : card.count); i++) {
          expanded.push(card);
        }
      }
    });
    this.thumbnailCards = expanded;
  }

  refreshCards(): void {
    this.recomputeThumbnails();
  }

  onFilterStateChange(): void {
    this.recomputeThumbnails();
  }

  filter(input: any): void {
    (this.dv as any).filter(input.target.value, 'contains');
  }
}
