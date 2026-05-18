export type PaperOrientation = 'portrait' | 'landscape';

/**
 * Project-scoped print profile. Captures everything a Pdf/Png sheet
 * formatter needs to lay out cards with professional print marks —
 * bleed, crop marks, registration marks, safe area. Stored in Dexie
 * so a project can ship its own preset alongside its decks.
 */
export interface PrintTemplate {
    id: number;
    projectId: number;
    name: string;
    description?: string;

    paperWidthIn: number;
    paperHeightIn: number;
    orientation: PaperOrientation;
    paperMarginsIn: number;

    cardWidthIn: number;
    cardHeightIn: number;
    cardMarginsIn: number;
    cardsPerPage: number;

    /** Bleed area in mm beyond the trim line. 0 disables bleed. */
    bleedMm: number;
    /** Safe-zone offset in mm where critical art must live. Diagnostic only. */
    safeAreaMm: number;
    cropMarks: boolean;
    registrationMarks: boolean;
    cornerMarks: boolean;

    mirrorBacksX: boolean;
    mirrorBacksY: boolean;

    /** Output rendering dots-per-inch when rasterising via html-to-image. */
    pixelRatio: number;
}
