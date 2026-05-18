# CIDEr — TODO

Resumen de lo hecho y lo que falta para retomar la sesión.
Plan completo en `~/.claude/plans/est-s-tingly-rossum.md` dentro del entorno de planificación.

## Estado actual de la rama `claude/check-status-quDOX`

### Hecho (commiteado y pusheado)
- **Phase 0 parcial** — entidad `Edition` (Dexie v3, deck-scoped) y entidad `Project` (Dexie v4, default project auto-creado). `Card` ganó `editionId?`. `Deck` ganó `projectId?`.
- **`ParentScopedService<E, I, P>`** — generaliza el patrón deck-child; `DecksChildService` queda como alias delgado.
- **`BackendStrategy` + `StrategySelectorService`** — type alias + servicio que expone el storage backend del Project seleccionado (sólo IndexedDB hoy; placeholder para Firebase).
- **Phase 8 — Card Viewer 3D** en `/decks/:id/cards/viewer`:
  - Carrusel Swiper coverflow + `Card3dTiltDirective` (tilt 3D al hover, respeta `prefers-reduced-motion`)
  - Toolbar: search libre + multi-select por edición + sort by edition/name + flip front/back
  - Atajos: ←/→ navega, Shift+←/→ salta edición, F search, Space flip, E edit advanced
  - Panel lateral: form reactive con `debounceTime(300)` que guarda en `CardsService`; tab "Actions" con Edit advanced / Duplicate / Export PNG / Export PDF / Delete (con `ConfirmationService`)
  - Re-group automático en carrusel cuando cambia `editionId` desde el form
- **Editions CRUD** en `/decks/:id/editions` reusando `EntityTableComponent`.
- **Phase 1 parcial** — `OutputFormatter` interface + `OUTPUT_FORMATTERS` `InjectionToken`. Formatters `SingleCardPngFormatter` y `SingleCardPdfFormatter`. El Viewer ya los consume.

### Hecho en este commit (Phase 4 parcial)
- **`computeTokenStats`** extraído de `entity-table.component.ts:174-199` a `shared/utils/token-stats.util.ts`. EntityTable ahora delega.
- **`DeckStatsComponent`** en `/decks/:id/stats` con 4 charts (`@swimlane/ngx-charts@20.5.0`):
  - Copies by edition (doughnut)
  - Copies-per-card distribution (vertical bar)
  - Distribution by attribute (horizontal bar, dropdown para elegir attr)
  - Top tokens (horizontal bar, dropdown para elegir campo)
- **Tab "Stats" todavía no agregada** en `cards-tab-menu.component.ts` — ruta accesible sólo por URL directa. Agregar `{label: 'Stats', icon: 'pi pi-fw pi-chart-bar', routerLink: [.../stats]}` cuando se retome.

---

## Próximos pasos por fase

### Fase 0 (cerrar)
- [ ] Refactor de rutas a prefijo `/projects/:projectId/decks/...` (tocar `app-routing.module.ts` + cada `routerLink` + `Router.navigate` de la app). Necesario para Firebase.
- [ ] `project.guard.ts` backend-agnostic: hoy gatea sólo en `electronService.getProjectHomeUrl()`; debe gatear en "hay un Project seleccionado".
- [ ] Pantalla "Projects" para listar/crear/elegir Project (welcome puede redirigir a ella).

### Fase 1 (cerrar)
- [ ] Extraer `ExportCardsComponent.exportCardSheets()`, `exportIndividualImages()`, `exportCardSheetsAsImages()` a 3 formatters:
  - `PdfSheetFormatter` (supports `card-sheet`)
  - `PngZipFormatter` (supports `card-sheet`)
  - `TtsFormatter` (supports `card-sheet`)
- [ ] Crear `shared/services/render-pipeline.service.ts` — extracción de `prerenderCardImages` para que los formatters reciban imágenes pre-renderizadas (el desacople del `@ViewChildren` requiere mover la pipeline a service stateful o invertir control con un callback "give me the DOM for card X").
- [ ] Reemplazar el switch de `export()` en `ExportCardsComponent` por `formatters.find(...).format(ctx)`.
- [ ] Mover helpers a `shared/utils`: `sliceIntoChunks`, `dataUrlToFile`, `zipFiles`, `promisesProgress` (ya existen ad hoc en `export-cards.component.ts:343+`).

### Fase 2 (print templates + marcas profesionales)
- [ ] `print-template.type.ts` y `print-templates.service.ts` (Project-scoped: nuevo uso de `ParentScopedService<PrintTemplate, number, number>` con `projectsService.getSelectedProject()` y `'projectId'`).
- [ ] Bump Dexie a **v5** con tabla `printTemplates: '++id, projectId, name'`.
- [ ] `PrintTemplatesComponent` con `EntityTableComponent`. Ruta `/projects/:projectId/print-templates`.
- [ ] `output-formatters/decorators/print-marks.decorator.ts` — overlay de bleed / crop / registro encima de cualquier sheet formatter (pdfmake canvas para PDF, SVG para PNG-ZIP).
- [ ] `PdfSheetFormatter` consume `bleedMm`, `cropMarks`, `mirrorBacksX/Y` del print template.
- [ ] Dropdown de perfiles en `export-cards.component.html`.

### Fase 4 (cerrar)
- [ ] **Agregar tab Stats en `cards-tab-menu.component.ts`** (línea ~25).
- [ ] `card-thumbnails/gallery-filters.component.ts` — extraer la lógica de filtros del Viewer (`recomputeGroups`, multi-edición, search, sort) a un servicio compartido `shared/services/card-filter-state.service.ts` para que Viewer y Thumbnails usen el mismo backend de filtrado.
- [ ] Aplicar filtros en `card-thumbnails.component.ts`.

### Fase 3 (HTML report)
- [ ] `output-formatters/html-report.formatter.ts` — `supports('report')`. HTML autocontenido con PNGs inline (data URIs); fallback a ZIP-con-carpeta si supera 25MB.
- [ ] `assets/report-templates/default.hbs` usando Handlebars (ya está en deps).
- [ ] Reusa `RenderPipelineService` (Fase 1).

### Fase 5 (spreadsheet editor)
- [ ] `cards-spreadsheet/cards-spreadsheet.component.{ts,html,scss}` con PrimeNG Table `editMode="cell"` + `pInplaceEditor`.
- [ ] `shared/directives/cell-paste.directive.ts` — pegado TSV/CSV usando `XlsxUtils`.
- [ ] `entity-table` recibe `@Input() editMode: 'row' | 'cell'` (default 'row').
- [ ] Tab "Sheet" en `cards-tab-menu`.

### Fase 6 (Firebase backend)
- [ ] Requiere Fase 0 cerrada (rutas `/projects/:projectId/...`).
- [ ] `firebase@^10.x` (NO `@angular/fire`).
- [ ] `data-services/firebase/firestore.service.ts` implementa `EntityService<E, string>`. Path: `/users/{uid}/projects/{projectId}/decks/{deckId}/{cards|cardTemplates|cardAttributes|editions|printTemplates}/{id}`.
- [ ] `data-services/firebase/firebase-storage.service.ts` para `Asset` binarios. Path: `assets/{uid}/{projectId}/{assetId}`.
- [ ] `data-services/firebase/auth.service.ts` anonymous / Google / email-password.
- [ ] `auth/login.component.ts` cuando el Project tiene `storageBackend='firebase'`.
- [ ] `environments/environment.ts` con config Firebase (override gitignored).
- [ ] `firestore.rules` (raíz repo) — solo lectura/escritura bajo `/users/{uid}/...`.
- [ ] `StrategySelectorService` retorna FirestoreService cuando `project.storageBackend === 'firebase'`. Hay que generalizar `IndexedDbService` → `BackendStrategy` y que cada concrete service tome el strategy del selector en lugar de extender `IndexedDbService` directamente.

### Fase 7 (quality gates)
- [ ] `.eslintrc.json` (`@angular-eslint` + `@typescript-eslint`).
- [ ] `.prettierrc.json`.
- [ ] `.github/workflows/ci.yml` (lint + test + build). El repo está en `solucionesvaltech/cider`; usar Node 18.
- [ ] Resolver lint findings preexistentes en commit separado para no inflar la PR del CI.

---

## Cosas a verificar manualmente en browser

(no hay Chrome en el container, no se pudo automatizar)

1. `/decks/:id/cards/viewer` con `cosmic-apple.json` cargado: carrusel responde a swipe/teclado/scroll; tilt 3D visible al hover.
2. Crear 2 Editions con colores distintos en `/decks/:id/editions`; asignar cartas desde el panel lateral del viewer; reload — el agrupamiento debería persistir.
3. Editar un atributo en el panel inline — el preview debería actualizarse en < 500ms.
4. Presionar **E** en el viewer — debería abrir `EntityDialogComponent` con la carta enfocada pre-poblada.
5. **Export PNG/PDF**: archivo descargado debería coincidir pixel-perfect con `card-preview`.
6. Buscar texto en el viewer: el carrusel debería reducirse a las cartas que matchean.
7. DevTools → emulate `prefers-reduced-motion: reduce` — el tilt 3D debería desactivarse, el carrusel mantenerse plano.
8. `/decks/:id/stats` (entrar por URL directa por ahora): 4 charts deberían renderizar.

## Limitaciones conocidas en lo entregado

- **Swiper init**: la carga inicial podría no aplicar el `slideTo` al primer card si `flatList` muta rápido. Si pasa: invocar `swiper.update()` después de mutaciones grandes.
- **Spotty performance con 500+ cartas**: Swiper renderiza todos los slides. Toca `virtual="true"` + `<swiper-slide virtualIndex>` cuando moleste.
- **CardPreviewComponent** sin template asignado: muestra HTML vacío. El export single-card lanzaría error porque `.card-element` no existiría.
- **Stats tab**: no está en `cards-tab-menu.component.ts:25-30` — sólo ruta directa.
- **Top-level `package.json/lock` huérfanos**: eliminados (eran residuo de un `npm install` mío en directorio equivocado).
