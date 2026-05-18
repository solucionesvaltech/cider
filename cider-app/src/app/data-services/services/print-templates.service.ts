import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { ProjectsChildService } from '../indexed-db/projects-child.service';
import { FieldType } from '../types/field-type.type';
import { PrintTemplate } from '../types/print-template.type';
import { ProjectsService } from './projects.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplatesService extends ProjectsChildService<PrintTemplate, number> {

  constructor(projectsService: ProjectsService, db: AppDB) {
    super(projectsService, db, AppDB.PRINT_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'projectId', header: 'Project ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, required: true},
      {field: 'description', header: 'Description', type: FieldType.textArea},
      {field: 'paperWidthIn', header: 'Paper Width (in)', type: FieldType.number},
      {field: 'paperHeightIn', header: 'Paper Height (in)', type: FieldType.number},
      {field: 'orientation', header: 'Orientation', type: FieldType.option,
        options: ['portrait', 'landscape']},
      {field: 'paperMarginsIn', header: 'Paper Margins (in)', type: FieldType.number},
      {field: 'cardWidthIn', header: 'Card Width (in)', type: FieldType.number},
      {field: 'cardHeightIn', header: 'Card Height (in)', type: FieldType.number},
      {field: 'cardMarginsIn', header: 'Card Margins (in)', type: FieldType.number},
      {field: 'cardsPerPage', header: 'Cards per Page', type: FieldType.number},
      {field: 'bleedMm', header: 'Bleed (mm)', type: FieldType.number,
        description: '0 = no bleed; typical print runs use 3 mm.'},
      {field: 'safeAreaMm', header: 'Safe Area (mm)', type: FieldType.number,
        description: 'Inner zone where critical art / text must live.'},
      {field: 'cropMarks', header: 'Crop Marks', type: FieldType.option,
        options: ['true', 'false']},
      {field: 'registrationMarks', header: 'Registration Marks', type: FieldType.option,
        options: ['true', 'false']},
      {field: 'cornerMarks', header: 'Corner Marks', type: FieldType.option,
        options: ['true', 'false']},
      {field: 'mirrorBacksX', header: 'Mirror Backs X', type: FieldType.option,
        options: ['true', 'false']},
      {field: 'mirrorBacksY', header: 'Mirror Backs Y', type: FieldType.option,
        options: ['true', 'false']},
      {field: 'pixelRatio', header: 'Pixel Ratio', type: FieldType.number}
    ]);
  }

  override getEntityName(entity: PrintTemplate): string {
    return entity.name;
  }

  /**
   * Built-in fallback used when the user hasn't created any print
   * template yet. Matches US Letter landscape with 3 mm bleed off and
   * the existing export-cards default geometry.
   */
  static defaultProfile(): PrintTemplate {
    return {
      id: 0, projectId: 0,
      name: 'US Letter (default)',
      description: 'Auto-generated fallback used when no print template is selected.',
      paperWidthIn: 8.5, paperHeightIn: 11,
      orientation: 'landscape', paperMarginsIn: 0.4,
      cardWidthIn: 2.5, cardHeightIn: 3.5, cardMarginsIn: 0.05,
      cardsPerPage: 6,
      bleedMm: 0, safeAreaMm: 3,
      cropMarks: false, registrationMarks: false, cornerMarks: false,
      mirrorBacksX: false, mirrorBacksY: true,
      pixelRatio: 1
    };
  }
}
