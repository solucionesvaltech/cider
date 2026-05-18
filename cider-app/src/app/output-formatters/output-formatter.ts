import { InjectionToken } from '@angular/core';
import { Card } from '../data-services/types/card.type';
import { CardTemplate } from '../data-services/types/card-template.type';

/**
 * What an OutputFormatter needs to do its job: the cards to render,
 * a way to look up their templates, and the rendered DOM nodes when
 * the formatter wants to grab them as pixels instead of regenerating
 * the HTML/CSS itself.
 *
 * Formatters that don't need the DOM (e.g. JSON, CSV) just ignore the
 * elementResolver.
 */
export interface OutputFormatterContext {
  cards: Card[];
  templateById: Map<number, CardTemplate>;
  /**
   * Return the DOM node that represents the front/back of a given card,
   * or undefined if the card isn't currently mounted in the view.
   */
  elementResolver?: (cardId: number, side: 'front' | 'back') => HTMLElement | undefined;
  /**
   * Optional progress hook (0..1).
   */
  onProgress?: (progress: number, info?: string) => void;
}

/**
 * What the formatter advertises about itself: a stable id, a label
 * shown in the export UI, and which export targets it supports.
 *
 * A "target" is the surface that triggers the export — "card-sheet"
 * (the existing batch exporter), "single-card" (the new Viewer exports),
 * or "report" (Phase 3 HTML report). Formatters can declare more than
 * one target if they're useful in multiple contexts.
 */
export interface OutputFormatter {
  readonly id: string;
  readonly displayName: string;
  readonly fileExtension: string;
  readonly mimeType: string;
  supports(target: OutputFormatterTarget): boolean;
  format(ctx: OutputFormatterContext): Promise<Blob>;
}

export type OutputFormatterTarget =
  | 'card-sheet'
  | 'single-card'
  | 'report';

export const OUTPUT_FORMATTERS = new InjectionToken<OutputFormatter[]>('OUTPUT_FORMATTERS');
