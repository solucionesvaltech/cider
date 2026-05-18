import { Component } from '@angular/core';
import { EditionsService } from '../data-services/services/editions.service';

@Component({
  selector: 'app-editions',
  templateUrl: './editions.component.html',
  styleUrls: ['./editions.component.scss']
})
export class EditionsComponent {

  constructor(public editionsService: EditionsService) { }

}
