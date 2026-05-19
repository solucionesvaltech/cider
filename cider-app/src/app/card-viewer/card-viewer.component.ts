import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener,
  Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { CardPreviewComponent } from '../card-preview/card-preview.component';
import { GalleryFiltersComponent } from '../gallery-filters/gallery-filters.component';
import { OUTPUT_FORMATTERS, OutputFormatter, OutputFormatterContext } from '../output-formatters/output-formatter';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { EditionsService } from '../data-services/services/editions.service';
import { Card } from '../data-services/types/card.type';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Edition } from '../data-services/types/edition.type';
import { EntityField } from '../data-services/types/entity-field.type';
import { FieldType } from '../data-services/types/field-type.type';
import FileUtils from '../shared/utils/file-utils';
import StringUtils from '../shared/utils/string-utils';

import {
  CardFilterState, EditionGroup, NO_EDITION_KEY, NO_EDITION_LABEL,
  applyFilterPipeline, defaultCardFilterState
} from '../shared/utils/card-filters.util';

interface SingleCardExportContext extends OutputFormatterContext {
  side: 'front' | 'back';
}

@Component({
  selector: 'app-card-viewer',
  templateUrl: './card-viewer.component.html',
  styleUrls: ['./card-viewer.component.scss'],
  providers: [ConfirmationService]
})
export class CardViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiper') swiperRef?: ElementRef<any>;
  @ViewChild('galleryFilters') galleryFilters?: GalleryFiltersComponent;
  @ViewChildren(CardPreviewComponent) previewComponents: QueryList<CardPreviewComponent> = {} as QueryList<CardPreviewComponent>;

  cards: Card[] = [];
  editions: Edition[] = [];
  templates: CardTemplate[] = [];
  templateById = new Map<number, CardTemplate>();
  fields: EntityField<Card>[] = [];

  groups: EditionGroup[] = [];
  flatList: Card[] = [];
  focusedIndex = 0;
  focusedCard?: Card;
  focusedEdition?: Edition | null;
  showBack = false;
  cardForm = new FormGroup({});

  filterState: CardFilterState = defaultCardFilterState();
  // proxy accessors so existing template bindings keep working
  get searchQuery(): string { return this.filterState.query; }
  set searchQuery(v: string) { this.filterState.query = v; }
  get selectedEditionIds(): (number | string)[] { return this.filterState.selectedEditionIds; }
  set selectedEditionIds(v: (number | string)[]) { this.filterState.selectedEditionIds = v; }
  get sortBy(): 'edition' | 'name' | 'none' { return this.filterState.sortBy; }
  set sortBy(v: 'edition' | 'name' | 'none') { this.filterState.sortBy = v; }

  sideOptions = [
    { label: 'Front', value: 'front' },
    { label: 'Back', value: 'back' }
  ];
  selectedSide: 'front' | 'back' = 'front';

  noEditionKey = NO_EDITION_KEY;
  noEditionLabel = NO_EDITION_LABEL;
  FieldType = FieldType;

  private swiperReady = false;
  private formSub?: Subscription;
  private saveSubject = new Subject<{ id: number; entity: Card }>();
  private saveSub?: Subscription;

  editDialogVisible = false;
  editDialogEntity: Card = {} as Card;

  constructor(
    public cardsService: CardsService,
    private editionsService: EditionsService,
    public templatesService: CardTemplatesService,
    private attributesService: CardAttributesService,
    private confirmationService: ConfirmationService,
    @Inject(OUTPUT_FORMATTERS) private formatters: OutputFormatter[],
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.reload();
    this.saveSub = this.saveSubject.pipe(debounceTime(350)).subscribe(({ id, entity }) => {
      this.cardsService.update(id, entity).catch(err => console.error('Failed to save card', err));
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.attachSwiperEvents());
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
    this.saveSub?.unsubscribe();
  }

  async reload(): Promise<void> {
    const [cards, editions, templates, fields] = await Promise.all([
      this.cardsService.getAll(),
      this.editionsService.getAll(),
      this.templatesService.getAll(),
      this.cardsService.getFields()
    ]);
    this.cards = cards;
    this.editions = editions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.templates = templates;
    this.templateById = new Map(templates.map(t => [t.id, t]));
    this.fields = fields.filter(f => !f.hidden);
    this.recomputeGroups();
    this.applyFocus(0);
  }

  recomputeGroups(): void {
    const { groups, flat } = applyFilterPipeline(this.cards, this.editions, this.filterState);
    this.groups = groups;
    this.flatList = flat;
  }

  onSearchChange(): void {
    this.recomputeGroups();
    this.applyFocus(0);
  }

  onFiltersChange(): void {
    this.recomputeGroups();
    this.applyFocus(0);
  }

  applyFocus(index: number): void {
    if (this.flatList.length === 0) {
      this.focusedCard = undefined;
      this.focusedEdition = undefined;
      this.cardForm = new FormGroup({});
      return;
    }
    const safe = ((index % this.flatList.length) + this.flatList.length) % this.flatList.length;
    this.focusedIndex = safe;
    this.focusedCard = this.flatList[safe];
    this.focusedEdition = this.focusedCard.editionId == null
      ? null
      : this.editions.find(e => e.id === this.focusedCard!.editionId) ?? null;
    this.buildForm(this.focusedCard);
    if (this.swiperReady && this.swiperRef?.nativeElement?.swiper) {
      try {
        this.swiperRef.nativeElement.swiper.slideTo(safe, 300);
      } catch (e) { /* swiper not ready yet */ }
    }
  }

  next(): void { this.applyFocus(this.focusedIndex + 1); }
  prev(): void { this.applyFocus(this.focusedIndex - 1); }

  nextGroup(): void {
    if (this.groups.length <= 1) {
      this.next();
      return;
    }
    const currentKey = this.currentGroupKey();
    const idx = this.groups.findIndex(g => g.key === currentKey);
    const targetGroup = this.groups[(idx + 1) % this.groups.length];
    const targetCard = targetGroup.cards[0];
    const targetIndex = this.flatList.findIndex(c => c.id === targetCard.id);
    this.applyFocus(targetIndex);
  }

  prevGroup(): void {
    if (this.groups.length <= 1) {
      this.prev();
      return;
    }
    const currentKey = this.currentGroupKey();
    const idx = this.groups.findIndex(g => g.key === currentKey);
    const targetGroup = this.groups[(idx - 1 + this.groups.length) % this.groups.length];
    const targetCard = targetGroup.cards[0];
    const targetIndex = this.flatList.findIndex(c => c.id === targetCard.id);
    this.applyFocus(targetIndex);
  }

  private currentGroupKey(): string {
    if (!this.focusedCard) return '';
    return this.focusedCard.editionId == null ? NO_EDITION_KEY : '' + this.focusedCard.editionId;
  }

  templateFor(card?: Card): CardTemplate | undefined {
    if (!card) return undefined;
    const id = this.showBack ? card.backCardTemplateId : card.frontCardTemplateId;
    return this.templateById.get(id);
  }

  flipSide(): void {
    this.showBack = !this.showBack;
  }

  private buildForm(card: Card): void {
    this.formSub?.unsubscribe();
    const controls: { [k: string]: FormControl } = {};
    this.fields
      .filter(f => f.field !== 'id' && f.field !== 'deckId')
      .forEach(f => {
        controls[f.field as string] = new FormControl((card as any)[f.field]);
      });
    this.cardForm = new FormGroup(controls);
    this.formSub = this.cardForm.valueChanges.pipe(debounceTime(300)).subscribe(value => {
      if (!this.focusedCard) return;
      const prevEditionId = this.focusedCard.editionId;
      const merged: Card = { ...this.focusedCard, ...(value as any) };
      this.focusedCard = merged;
      const masterIdx = this.cards.findIndex(c => c.id === merged.id);
      if (masterIdx >= 0) this.cards[masterIdx] = merged;
      this.focusedEdition = merged.editionId == null
        ? null
        : this.editions.find(e => e.id === merged.editionId) ?? null;
      this.saveSubject.next({ id: merged.id, entity: merged });
      if (merged.editionId !== prevEditionId && this.sortBy === 'edition') {
        this.recomputeGroups();
        const newIdx = this.flatList.findIndex(c => c.id === merged.id);
        if (newIdx >= 0) this.focusedIndex = newIdx;
      } else {
        const idx = this.flatList.findIndex(c => c.id === merged.id);
        if (idx >= 0) this.flatList[idx] = merged;
      }
    });
  }

  private attachSwiperEvents(): void {
    const el: any = this.swiperRef?.nativeElement;
    if (!el) return;
    el.addEventListener('slidechange', (event: any) => {
      const swiper = event?.detail?.[0] ?? el.swiper;
      if (swiper && typeof swiper.activeIndex === 'number') {
        this.applyFocus(swiper.activeIndex);
        this.cdr.detectChanges();
      }
    });
    el.addEventListener('init', () => {
      this.swiperReady = true;
      if (this.focusedIndex > 0) {
        try { el.swiper.slideTo(this.focusedIndex, 0); } catch (e) { /* noop */ }
      }
    });
    // swiper-element fires 'init' synchronously on first render; mark ready optimistically too
    this.swiperReady = true;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.target && (event.target as HTMLElement).matches('input, textarea, select')) {
      if (event.key === 'Escape') {
        (event.target as HTMLElement).blur();
        event.preventDefault();
      }
      return;
    }
    switch (event.key) {
      case 'ArrowRight':
        if (event.shiftKey) this.nextGroup(); else this.next();
        event.preventDefault();
        break;
      case 'ArrowLeft':
        if (event.shiftKey) this.prevGroup(); else this.prev();
        event.preventDefault();
        break;
      case 'f':
      case 'F':
        this.galleryFilters?.focusSearch();
        event.preventDefault();
        break;
      case ' ':
        this.flipSide();
        event.preventDefault();
        break;
      case 'e':
      case 'E':
        this.openEditDialog();
        event.preventDefault();
        break;
    }
  }

  editionColor(edition: Edition | null | undefined): string {
    return edition?.color || '#3e4b5b';
  }

  optionsForField(field: EntityField<Card>): Promise<any[]> {
    if (field.service) {
      return field.service.getAll();
    }
    const opts = field.options || [];
    return Promise.resolve(opts.map(o => ({ label: o, value: o })));
  }

  optionLabelKey(field: EntityField<Card>): string {
    return field.service ? 'name' : 'label';
  }

  optionValueKey(field: EntityField<Card>): string {
    return field.service ? field.service.getIdField() : 'value';
  }

  async exportFocusedAsPng(): Promise<void> {
    await this.runSingleCardFormatter('single-card-png');
  }

  async exportFocusedAsPdf(): Promise<void> {
    await this.runSingleCardFormatter('single-card-pdf');
  }

  private async runSingleCardFormatter(formatterId: string): Promise<void> {
    if (!this.focusedCard) return;
    const formatter = this.formatters.find(f => f.id === formatterId);
    if (!formatter) {
      console.warn(`Output formatter "${formatterId}" not registered`);
      return;
    }
    const ctx: SingleCardExportContext = {
      cards: [this.focusedCard],
      templateById: this.templateById,
      side: this.showBack ? 'back' : 'front',
      elementResolver: (cardId, side) => this.resolveCardElement(cardId, side)
    };
    try {
      const blob = await formatter.format(ctx);
      FileUtils.saveAs(blob, `${this.focusedFileName()}.${formatter.fileExtension}`);
    } catch (err) {
      console.error(`Export failed (${formatterId})`, err);
    }
  }

  private resolveCardElement(cardId: number, side: 'front' | 'back'): HTMLElement | undefined {
    if (!this.previewComponents) return undefined;
    const wantedSide = side;
    const previews = this.previewComponents.toArray()
      .filter(p => p.card?.id === cardId);
    // The viewer currently mounts one preview per slide using the side
    // chosen by templateFor(); pick the one whose template matches the
    // requested side or fall back to the only mounted preview.
    const preferred = previews.find(p => {
      const template = (p as any).template;
      if (!template?.id || !this.focusedCard) return false;
      const expected = wantedSide === 'front'
        ? this.focusedCard.frontCardTemplateId
        : this.focusedCard.backCardTemplateId;
      return template.id === expected;
    });
    const preview = preferred || previews[0];
    if (!preview) return undefined;
    const el: HTMLElement = (preview as any).element.nativeElement;
    return (el.querySelector('.card-element') as HTMLElement | null) || undefined;
  }

  private focusedFileName(): string {
    const base = this.focusedCard?.name ? StringUtils.toKebabCase(this.focusedCard.name) : 'card';
    return `${base}-${this.showBack ? 'back' : 'front'}`;
  }

  openEditDialog(): void {
    if (!this.focusedCard) return;
    this.editDialogEntity = { ...this.focusedCard };
    this.editDialogVisible = true;
  }

  async duplicateFocused(): Promise<void> {
    if (!this.focusedCard) return;
    const { id, ...rest } = this.focusedCard;
    const copy = { ...rest, name: (this.focusedCard.name || 'Card') + ' (copy)' } as Card;
    const created = await this.cardsService.create(copy);
    await this.reload();
    const idx = this.flatList.findIndex(c => c.id === (created as any).id);
    if (idx >= 0) this.applyFocus(idx);
  }

  deleteFocused(): void {
    if (!this.focusedCard) return;
    const card = this.focusedCard;
    this.confirmationService.confirm({
      message: `Delete card "${card.name || 'Untitled'}"? This can't be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        await this.cardsService.delete(card.id);
        const prevIndex = this.focusedIndex;
        await this.reload();
        if (this.flatList.length > 0) {
          this.applyFocus(Math.min(prevIndex, this.flatList.length - 1));
        }
      }
    });
  }

  async onEditDialogClose(): Promise<void> {
    await this.reload();
    if (this.editDialogEntity && this.editDialogEntity.id) {
      const idx = this.flatList.findIndex(c => c.id === this.editDialogEntity.id);
      if (idx >= 0) this.applyFocus(idx);
    }
  }
}
