import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-export-selection-dialog',
  templateUrl: './export-selection-dialog.component.html',
  styleUrls: ['./export-selection-dialog.component.scss']
})
export class ExportSelectionDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onApply: EventEmitter<Card | Card[] | undefined> = new EventEmitter();
  public cards: Card | Card[] | undefined = [];

  constructor(public cardsService: CardsService) {
    cardsService.getAll().then(cards => {
      this.cards = cards;
    });
  }

  ngOnInit(): void {
  }

  public apply() {
    this.onApply.emit(this.cards);
    this.hideDialog();
  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

}
