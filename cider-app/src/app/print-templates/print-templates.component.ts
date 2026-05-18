import { Component } from '@angular/core';
import { PrintTemplatesService } from '../data-services/services/print-templates.service';

@Component({
  selector: 'app-print-templates',
  templateUrl: './print-templates.component.html',
  styleUrls: ['./print-templates.component.scss']
})
export class PrintTemplatesComponent {
  constructor(public printTemplatesService: PrintTemplatesService) { }
}
