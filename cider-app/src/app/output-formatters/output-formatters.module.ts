import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OUTPUT_FORMATTERS } from './output-formatter';
import { SingleCardPngFormatter } from './single-card-png.formatter';
import { SingleCardPdfFormatter } from './single-card-pdf.formatter';

/**
 * Registers every OutputFormatter under the OUTPUT_FORMATTERS multi
 * provider so consumers can `@Inject(OUTPUT_FORMATTERS)` to receive
 * the full list and call .supports() / .format() on the right one.
 *
 * Sheet/zip/tts formatters extracted from ExportCardsComponent will
 * join this list in a follow-up commit (Phase 1 full extraction).
 */
@NgModule({
  imports: [CommonModule],
  providers: [
    SingleCardPngFormatter,
    SingleCardPdfFormatter,
    { provide: OUTPUT_FORMATTERS, useExisting: SingleCardPngFormatter, multi: true },
    { provide: OUTPUT_FORMATTERS, useExisting: SingleCardPdfFormatter, multi: true }
  ]
})
export class OutputFormattersModule { }
