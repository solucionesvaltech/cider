import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Edition } from '../data-services/types/edition.type';
import { CardFilterState, CardSortBy } from '../shared/utils/card-filters.util';

interface SortOption { label: string; value: CardSortBy; }

/**
 * Reusable filter strip for any list of cards: free-text search, multi
 * select by Edition, and a sort selector. Designed to be two-way bound
 * via [(state)] on a CardFilterState, so consumers can also persist or
 * react to filter changes via (change).
 *
 * @Input editions     — list rendered in the multi-select (hidden when empty).
 * @Input showNatural  — adds a "Natural" sort option (defaults to true).
 * @Input searchPlaceholder — placeholder shown inside the search box.
 * @ViewChild('searchInput') — host components can grab this to focus
 *                              the search box from a keyboard shortcut.
 */
@Component({
  selector: 'app-gallery-filters',
  templateUrl: './gallery-filters.component.html',
  styleUrls: ['./gallery-filters.component.scss']
})
export class GalleryFiltersComponent {
  @Input() editions: Edition[] = [];
  @Input() state!: CardFilterState;
  @Input() showNatural = true;
  @Input() searchPlaceholder = 'Search';
  @Output() stateChange = new EventEmitter<CardFilterState>();
  @Output() change = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  get sortOptions(): SortOption[] {
    const opts: SortOption[] = [
      { label: 'By edition', value: 'edition' },
      { label: 'By name', value: 'name' }
    ];
    if (this.showNatural) {
      opts.push({ label: 'Natural', value: 'none' });
    }
    return opts;
  }

  emit(): void {
    this.stateChange.emit(this.state);
    this.change.emit();
  }

  focusSearch(): void {
    this.searchInput?.nativeElement.focus();
  }
}
