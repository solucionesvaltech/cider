import { Injectable } from '@angular/core';
import * as htmlToImage from 'html-to-image';
import { OutputFormatter, OutputFormatterContext, OutputFormatterTarget } from './output-formatter';

/**
 * Renders the focused card to a single PNG by grabbing the matching
 * .card-element DOM node from the calling component and feeding it
 * through html-to-image. Used by the Card Viewer's Export PNG action.
 */
@Injectable({ providedIn: 'root' })
export class SingleCardPngFormatter implements OutputFormatter {
  readonly id = 'single-card-png';
  readonly displayName = 'PNG image';
  readonly fileExtension = 'png';
  readonly mimeType = 'image/png';

  supports(target: OutputFormatterTarget): boolean {
    return target === 'single-card';
  }

  async format(ctx: OutputFormatterContext): Promise<Blob> {
    if (!ctx.cards.length) {
      throw new Error('No cards provided to single-card formatter');
    }
    if (!ctx.elementResolver) {
      throw new Error('single-card-png needs an elementResolver to find the rendered DOM');
    }
    const card = ctx.cards[0];
    const side: 'front' | 'back' = (ctx as any).side || 'front';
    const target = ctx.elementResolver(card.id, side);
    if (!target) {
      throw new Error(`Could not find rendered card element for card ${card.id} (${side})`);
    }
    const dataUrl = await htmlToImage.toPng(target, { pixelRatio: 2 });
    return (await fetch(dataUrl)).blob();
  }
}
