import { Injectable } from '@angular/core';
import * as htmlToImage from 'html-to-image';
import * as pdfMake from 'pdfmake/build/pdfmake';
import { OutputFormatter, OutputFormatterContext, OutputFormatterTarget } from './output-formatter';

/**
 * Renders the focused card to a 1-page PDF whose page size matches
 * the card's pixel dimensions (so there's no whitespace around the
 * card). Print marks integration is a follow-up once Phase 2 lands
 * the print-template entity.
 */
@Injectable({ providedIn: 'root' })
export class SingleCardPdfFormatter implements OutputFormatter {
  readonly id = 'single-card-pdf';
  readonly displayName = 'PDF (single page)';
  readonly fileExtension = 'pdf';
  readonly mimeType = 'application/pdf';

  supports(target: OutputFormatterTarget): boolean {
    return target === 'single-card';
  }

  async format(ctx: OutputFormatterContext): Promise<Blob> {
    if (!ctx.cards.length) {
      throw new Error('No cards provided to single-card formatter');
    }
    if (!ctx.elementResolver) {
      throw new Error('single-card-pdf needs an elementResolver to find the rendered DOM');
    }
    const card = ctx.cards[0];
    const side: 'front' | 'back' = (ctx as any).side || 'front';
    const target = ctx.elementResolver(card.id, side);
    if (!target) {
      throw new Error(`Could not find rendered card element for card ${card.id} (${side})`);
    }
    const widthPx = target.offsetWidth || 750;
    const heightPx = target.offsetHeight || 1050;
    const dataUrl = await htmlToImage.toPng(target, { pixelRatio: 2 });
    const docDefinition: any = {
      content: [{ image: dataUrl, width: widthPx, height: heightPx }],
      pageSize: { width: widthPx, height: heightPx },
      pageMargins: [0, 0, 0, 0]
    };
    return new Promise<Blob>((resolve, reject) => {
      try {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => resolve(blob));
      } catch (err) {
        reject(err);
      }
    });
  }
}
