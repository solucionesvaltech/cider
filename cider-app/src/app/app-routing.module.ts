import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { CardViewerComponent } from './card-viewer/card-viewer.component';
import { CardsComponent } from './cards/cards.component';
import { DeckStatsComponent } from './deck-stats/deck-stats.component';
import { EditionsComponent } from './editions/editions.component';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { PrintTemplatesComponent } from './print-templates/print-templates.component';
import { ProjectsComponent } from './projects/projects.component';
import { DeckGuard } from './deck.guard';
import { DecksComponent } from './decks/decks.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProjectGuard } from './project.guard';

const routes: Routes = [
  { path: 'projects', component: ProjectsComponent},
  { path: 'decks', component: DecksComponent, canActivate: [ProjectGuard]},
  { path: 'assets', component: AssetsComponent, canActivate: [ProjectGuard]},
  { path: 'print-templates', component: PrintTemplatesComponent, canActivate: [ProjectGuard]},
  { path: 'decks/:deckId/cards', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/listing', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/viewer', component: CardViewerComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/attributes', component: CardAttributesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/stats', component: DeckStatsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/editions', component: EditionsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/card-templates', component: CardTemplatesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/export-cards', component: ExportCardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: '**', component: WelcomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
