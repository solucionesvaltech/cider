import { PrintTemplate } from '../data-services/types/print-template.type';
import { backgroundForProfile, buildPrintMarks } from './print-marks.util';

const baseProfile = (overrides: Partial<PrintTemplate> = {}): PrintTemplate => ({
  id: 1, projectId: 1, name: 'Test', description: '',
  paperWidthIn: 8.5, paperHeightIn: 11, orientation: 'landscape',
  paperMarginsIn: 0.4,
  cardWidthIn: 2.5, cardHeightIn: 3.5, cardMarginsIn: 0.05, cardsPerPage: 6,
  bleedMm: 0, safeAreaMm: 3,
  cropMarks: false, registrationMarks: false, cornerMarks: false,
  mirrorBacksX: false, mirrorBacksY: false, pixelRatio: 1,
  ...overrides
});

const PAGE_W = 612; // 8.5 in * 72 dpi
const PAGE_H = 792; // 11 in * 72 dpi

describe('print-marks.util', () => {
  describe('buildPrintMarks', () => {
    it('returns no marks when every flag is off', () => {
      expect(buildPrintMarks(baseProfile(), PAGE_W, PAGE_H)).toEqual([]);
    });

    it('emits 8 line items for cropMarks (2 segments per corner * 4 corners)', () => {
      const marks = buildPrintMarks(baseProfile({ cropMarks: true }), PAGE_W, PAGE_H);
      const lines = marks.filter(m => m.type === 'line');
      expect(lines.length).toBe(8);
    });

    it('cropMark positions shift outward by the bleed', () => {
      const noBleed = buildPrintMarks(baseProfile({ cropMarks: true, bleedMm: 0 }), PAGE_W, PAGE_H);
      const withBleed = buildPrintMarks(baseProfile({ cropMarks: true, bleedMm: 3 }), PAGE_W, PAGE_H);
      const noBleedTopLeft = noBleed.find(m => m.x1 < 50 && m.y1 < 50 && m.x2 < 50)!;
      const bleedTopLeft = withBleed.find(m => m.x1 < 50 && m.y1 < 50 && m.x2 < 50)!;
      // both marks live on the same horizontal segment (y1==y2) at the top-left corner
      // and the bleed version sits further outward (smaller y for the top side).
      expect(bleedTopLeft.y1).toBeLessThan(noBleedTopLeft.y1);
    });

    it('cornerMarks emit 8 lines (2 per corner * 4 corners)', () => {
      const marks = buildPrintMarks(baseProfile({ cornerMarks: true }), PAGE_W, PAGE_H);
      expect(marks.length).toBe(8);
      expect(marks.every(m => m.type === 'line')).toBe(true);
    });

    it('registrationMarks emit an ellipse plus a crosshair at top and bottom centres', () => {
      const marks = buildPrintMarks(baseProfile({ registrationMarks: true }), PAGE_W, PAGE_H);
      const ellipses = marks.filter(m => m.type === 'ellipse');
      const lines = marks.filter(m => m.type === 'line');
      expect(ellipses.length).toBe(2);
      expect(lines.length).toBe(4);
      // both ellipses sit on the horizontal centre of the page.
      ellipses.forEach(e => expect(e.x).toBeCloseTo(PAGE_W / 2, 3));
    });
  });

  describe('backgroundForProfile', () => {
    it('returns undefined when no marks are requested', () => {
      expect(backgroundForProfile(baseProfile())).toBeUndefined();
    });

    it('returns undefined when no profile is provided', () => {
      expect(backgroundForProfile(undefined)).toBeUndefined();
    });

    it('returns a callback that produces canvas content per page', () => {
      const bg = backgroundForProfile(baseProfile({ cropMarks: true }))!;
      const out = bg(1, { width: PAGE_W, height: PAGE_H });
      expect(out).toBeTruthy();
      expect(Array.isArray((out as any).canvas)).toBe(true);
    });
  });
});
