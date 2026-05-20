import { Injectable } from '@angular/core';
import { Card } from '../data-services/types/card.type';
import { OutputFormatter, OutputFormatterContext, OutputFormatterTarget } from './output-formatter';
import { applyFilterPipeline, defaultCardFilterState } from '../shared/utils/card-filters.util';

/**
 * Produces a standalone, self-contained HTML document summarising a
 * deck: headline counts plus one table per edition listing every
 * card and its visible attributes. No images, no external assets —
 * the file opens anywhere and is safe to email or commit.
 */
@Injectable({ providedIn: 'root' })
export class DeckSummaryHtmlFormatter implements OutputFormatter {
  readonly id = 'deck-summary-html';
  readonly displayName = 'Deck summary (HTML)';
  readonly fileExtension = 'html';
  readonly mimeType = 'text/html';

  supports(target: OutputFormatterTarget): boolean {
    return target === 'report';
  }

  async format(ctx: OutputFormatterContext): Promise<Blob> {
    const deckName = ctx.deckName || 'Deck';
    const editions = ctx.editions || [];
    const fields = (ctx.fields || []).filter(f =>
      f.field !== 'id' && f.field !== 'deckId' && f.field !== 'editionId' && !f.hidden);
    const cards = ctx.cards || [];

    const totalCopies = cards.reduce((sum, c) => sum + (Number(c.count) || 1), 0);
    const uniqueNames = new Set(cards.map(c => (c.name || '').trim().toLowerCase())).size;

    const { groups } = applyFilterPipeline(cards, editions, {
      ...defaultCardFilterState(), sortBy: 'edition'
    });

    const sections = groups.map(group => {
      const heading = group.edition ? group.edition.name : 'Sin edición';
      const groupCopies = group.cards.reduce((s, c) => s + (Number(c.count) || 1), 0);
      const rows = group.cards.map(card => this.cardRow(card, fields)).join('\n');
      return `
        <section class="edition">
          <h2>${this.escape(heading)}
            <span class="badge">${group.cards.length} cards / ${groupCopies} copies</span>
          </h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th class="num">Count</th>
                ${fields.map(f => `<th>${this.escape(f.header)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    }).join('\n');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${this.escape(deckName)} — Deck Summary</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 32px;
    background: #0f1116; color: #e8edf5; }
  h1 { margin: 0 0 4px; font-size: 1.8rem; }
  .meta { opacity: 0.6; margin-bottom: 24px; font-size: 0.9rem; }
  .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
  .tile { background: #1d2330; border-radius: 10px; padding: 12px 18px; min-width: 120px; }
  .tile .v { font-size: 1.5rem; font-weight: 700; }
  .tile .l { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.6; }
  section.edition { margin-bottom: 32px; }
  h2 { font-size: 1.2rem; border-bottom: 1px solid #2b3340; padding-bottom: 6px; }
  .badge { font-size: 0.75rem; font-weight: 500; opacity: 0.6; margin-left: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #232a36; }
  th { opacity: 0.7; font-weight: 600; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  tbody tr:hover { background: #181d28; }
  footer { margin-top: 40px; opacity: 0.4; font-size: 0.75rem; }
</style>
</head>
<body>
  <h1>${this.escape(deckName)}</h1>
  <div class="meta">Deck summary generated ${new Date().toLocaleString()}</div>
  <div class="summary">
    <div class="tile"><div class="v">${cards.length}</div><div class="l">Unique cards</div></div>
    <div class="tile"><div class="v">${totalCopies}</div><div class="l">Total copies</div></div>
    <div class="tile"><div class="v">${uniqueNames}</div><div class="l">Unique names</div></div>
    <div class="tile"><div class="v">${editions.length}</div><div class="l">Editions</div></div>
  </div>
  ${sections}
  <footer>Exported from Cider.</footer>
</body>
</html>`;

    return new Blob([html], { type: 'text/html;charset=utf-8' });
  }

  private cardRow(card: Card, fields: { field: string | number | symbol; header: string }[]): string {
    const cells = fields.map(f => {
      const raw = (card as any)[f.field];
      return `<td>${this.escape(raw === undefined || raw === null ? '' : '' + raw)}</td>`;
    }).join('');
    return `<tr><td>${this.escape(card.name || '')}</td>` +
      `<td class="num">${Number(card.count) || 1}</td>${cells}</tr>`;
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
