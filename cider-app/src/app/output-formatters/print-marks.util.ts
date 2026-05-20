import { PrintTemplate } from '../data-services/types/print-template.type';

/**
 * pdfmake "canvas" element vocabulary.
 *
 *   { type: 'line', x1, y1, x2, y2, lineWidth, lineColor }
 *   { type: 'rect', x, y, w, h, lineWidth, color, lineColor }
 *   { type: 'ellipse', x, y, r1, r2, color, lineColor }
 *
 * All coordinates are in PDF points (72 dpi). PdfMake calls our
 * `background` function once per page with (currentPage, pageSize)
 * and expects a content element back — typically `{ canvas: [...] }`.
 */
export interface PdfCanvasItem {
  type: 'line' | 'rect' | 'ellipse';
  [k: string]: any;
}

const PDF_DPI = 72;
const MM_PER_INCH = 25.4;

function mmToPt(mm: number): number {
  return (mm / MM_PER_INCH) * PDF_DPI;
}

function inToPt(inches: number): number {
  return inches * PDF_DPI;
}

/**
 * Compute the marks (crop, registration, corner) for a single
 * print sheet given the active PrintTemplate and the page geometry.
 *
 * Returns an array of pdfmake canvas items that, when fed into the
 * `canvas` element of a content stack or a `background` callback,
 * draws the marks on top of the rendered cards.
 *
 * Coordinates: top-left origin, in PDF points. The caller should
 * place the cards image at (paperMarginsIn * 72, paperMarginsIn * 72)
 * with width/height = (paperWidth - 2*margins) * 72 in points.
 */
export function buildPrintMarks(
  profile: PrintTemplate,
  pageWidthPt: number,
  pageHeightPt: number
): PdfCanvasItem[] {
  const marks: PdfCanvasItem[] = [];
  if (!profile.cropMarks && !profile.registrationMarks && !profile.cornerMarks) {
    return marks;
  }

  const marginPt = inToPt(profile.paperMarginsIn);
  const trimX1 = marginPt;
  const trimY1 = marginPt;
  const trimX2 = pageWidthPt - marginPt;
  const trimY2 = pageHeightPt - marginPt;

  const bleedPt = mmToPt(Math.max(0, profile.bleedMm));
  const markLengthPt = mmToPt(3);
  const markGapPt = mmToPt(2);
  const lineWidth = 0.5;
  const lineColor = '#000000';

  if (profile.cropMarks) {
    // Four-corner crop marks at the trim edges, offset outward by the bleed.
    const corners = [
      { x: trimX1 - bleedPt, y: trimY1 - bleedPt, dx: -1, dy: -1 },
      { x: trimX2 + bleedPt, y: trimY1 - bleedPt, dx: 1, dy: -1 },
      { x: trimX1 - bleedPt, y: trimY2 + bleedPt, dx: -1, dy: 1 },
      { x: trimX2 + bleedPt, y: trimY2 + bleedPt, dx: 1, dy: 1 }
    ];
    corners.forEach(c => {
      marks.push({
        type: 'line',
        x1: c.x + c.dx * markGapPt, y1: c.y,
        x2: c.x + c.dx * (markGapPt + markLengthPt), y2: c.y,
        lineWidth, lineColor
      });
      marks.push({
        type: 'line',
        x1: c.x, y1: c.y + c.dy * markGapPt,
        x2: c.x, y2: c.y + c.dy * (markGapPt + markLengthPt),
        lineWidth, lineColor
      });
    });
  }

  if (profile.cornerMarks) {
    // Inward L-shaped marks aligned to the trim corners (helps the operator
    // verify the corner of every card lands inside the trim box).
    const ll = mmToPt(5);
    const corners = [
      { x: trimX1, y: trimY1, dx: 1, dy: 1 },
      { x: trimX2, y: trimY1, dx: -1, dy: 1 },
      { x: trimX1, y: trimY2, dx: 1, dy: -1 },
      { x: trimX2, y: trimY2, dx: -1, dy: -1 }
    ];
    corners.forEach(c => {
      marks.push({
        type: 'line', x1: c.x, y1: c.y, x2: c.x + c.dx * ll, y2: c.y,
        lineWidth, lineColor
      });
      marks.push({
        type: 'line', x1: c.x, y1: c.y, x2: c.x, y2: c.y + c.dy * ll,
        lineWidth, lineColor
      });
    });
  }

  if (profile.registrationMarks) {
    // Centred registration targets at top/bottom edges (CMYK alignment proxy).
    const cx = pageWidthPt / 2;
    const ring = mmToPt(4);
    const cross = mmToPt(6);
    [marginPt / 2, pageHeightPt - marginPt / 2].forEach(cy => {
      marks.push({ type: 'ellipse', x: cx, y: cy, r1: ring, r2: ring, lineColor, lineWidth, color: undefined });
      marks.push({
        type: 'line', x1: cx - cross, y1: cy, x2: cx + cross, y2: cy,
        lineWidth, lineColor
      });
      marks.push({
        type: 'line', x1: cx, y1: cy - cross, x2: cx, y2: cy + cross,
        lineWidth, lineColor
      });
    });
  }

  return marks;
}

/**
 * Wrap buildPrintMarks() into a pdfmake-compatible `background`
 * callback. Pass the result directly into `docDefinition.background`.
 */
export function backgroundForProfile(profile: PrintTemplate | undefined) {
  if (!profile) return undefined;
  if (!profile.cropMarks && !profile.registrationMarks && !profile.cornerMarks) {
    return undefined;
  }
  return (_currentPage: number, pageSize: { width: number; height: number }) => {
    const marks = buildPrintMarks(profile, pageSize.width, pageSize.height);
    return marks.length > 0 ? { canvas: marks } : null;
  };
}
