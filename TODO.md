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

### Hecho — Phase 4 parcial (Deck Stats)
- **`computeTokenStats`** extraído de `entity-table.component.ts:174-199` a `shared/utils/token-stats.util.ts`. EntityTable ahora delega. Tests en `token-stats.util.spec.ts`.
- **`DeckStatsComponent`** en `/decks/:id/stats` con 4 charts (`@swimlane/ngx-charts@20.5.0`):
  - Copies by edition (doughnut)
  - Copies-per-card distribution (vertical bar)
  - Distribution by attribute (horizontal bar, dropdown para elegir attr)
  - Top tokens (horizontal bar, dropdown para elegir campo)
- **Tab "Stats"** ya wired en `cards-tab-menu`.

### Hecho — Phase 4 parcial (filtros compartidos)
- **`shared/utils/card-filters.util.ts`** — pipeline pure (filterCards, groupByEdition, applyFilterPipeline) usado por Viewer y Thumbnails. Tests en `card-filters.util.spec.ts`.
- **Card Thumbnails** ahora tiene multi-select por edición + sort dropdown (paridad parcial con Viewer).

### Hecho — Phase 2 (print templates + marcas)
- **`PrintTemplate` entity** + **Dexie v5** (`printTemplates: '++id, projectId, name'`).
- **`ProjectsChildService`** sibling de DecksChildService (FK=`projectId`).
- **`PrintTemplatesService`** + componente CRUD en `/print-templates` + ítem top-level menu.
- **`print-marks.util.ts`** — convierte un PrintTemplate en items canvas pdfmake (crop, registration, corner marks con bleed offset). Tests en `print-marks.util.spec.ts`.
- **`ExportCardsComponent`** ahora tiene dropdown "Print Profile": al elegir uno, sobreescribe geometría y agrega marcas vía `docDefinition.background`. Sin profile → comportamiento legacy intacto.

### Hecho — Phase 0 (Projects landing)
- **`ProjectsComponent`** en `/projects` con EntityTable + botón Select Project (mismo contrato que DecksComponent). Top-level menu item "Projects".
- Ruta no gated por ProjectGuard (es el lugar donde se elige el proyecto — gating crearía loop).

---

## Próximos pasos por fase

### Fase 0 (cerrar)
- [ ] Refactor de rutas a prefijo `/projects/:projectId/decks/...` (tocar `app-routing.module.ts` + cada `routerLink` + `Router.navigate` de la app). Necesario para Firebase.
- [ ] `project.guard.ts` backend-agnostic: hoy gatea sólo en `electronService.getProjectHomeUrl()`; debe gatear en "hay un Project seleccionado".
- [x] ~~Pantalla "Projects" para listar/crear/elegir Project~~ — hecho en `/projects`.
- [x] ~~Welcome surface a `/projects`~~ — card de bienvenida web con "Browse Projects" + "Get Started" (cae a `/projects` si no hay project seleccionado).

### Fase 1 (cerrar)
- [ ] Extraer `ExportCardsComponent.exportCardSheets()`, `exportIndividualImages()`, `exportCardSheetsAsImages()` a 3 formatters:
  - `PdfSheetFormatter` (supports `card-sheet`)
  - `PngZipFormatter` (supports `card-sheet`)
  - `TtsFormatter` (supports `card-sheet`)
- [ ] Crear `shared/services/render-pipeline.service.ts` — extracción de `prerenderCardImages` para que los formatters reciban imágenes pre-renderizadas (el desacople del `@ViewChildren` requiere mover la pipeline a service stateful o invertir control con un callback "give me the DOM for card X").
- [ ] Reemplazar el switch de `export()` en `ExportCardsComponent` por `formatters.find(...).format(ctx)`.
- [ ] Mover helpers a `shared/utils`: `sliceIntoChunks`, `dataUrlToFile`, `zipFiles`, `promisesProgress` (ya existen ad hoc en `export-cards.component.ts:343+`).

### Fase 2 (print templates + marcas profesionales) — CASI COMPLETA
- [x] ~~`print-template.type.ts`, `print-templates.service.ts`, Dexie v5, `PrintTemplatesComponent`~~
- [x] ~~Marcas de impresión vía `print-marks.util.ts` + `docDefinition.background`~~
- [x] ~~Dropdown de perfiles en `export-cards.component.html`~~
- [ ] Mover `PRINT_TEMPLATES` a `/projects/:projectId/print-templates` cuando Fase 0 cierre el route refactor.
- [ ] Trigger marcas también en el formato Tabletop Simulator / individual-image (hoy sólo en PDF sheet export).
- [x] ~~Renderizar guides de bleed/trim/safe-area en el preview~~ — `card-preview` con `[showPrintGuides]`/`[printTemplate]`, toggle + dropdown en el Viewer.

### Fase 4 (cerrar)
- [x] ~~Tab Stats en cards-tab-menu~~
- [x] ~~Filtros compartidos viewer/thumbnails vía `shared/utils/card-filters.util.ts`~~
- [x] ~~Extraer la barra de filtros a `<app-gallery-filters [(state)]>`~~ — usado por Viewer y Thumbnails.
- [ ] Filtros adicionales: por tipo de carta, por count > N, "only with templates assigned".

### Fase 3 (HTML report)
- [x] ~~`DeckSummaryHtmlFormatter`~~ — `supports('report')`, HTML autocontenido text-only (counts + tabla por edición). Botón "Export Summary" en Deck Stats.
- [ ] `output-formatters/card-gallery-html.formatter.ts` — variante con PNGs inline (data URIs) de cada carta; fallback a ZIP-con-carpeta si supera 25MB. Requiere `RenderPipelineService` (Fase 1) o un `elementResolver`.
- [ ] `assets/report-templates/default.hbs` usando Handlebars (ya está en deps) si se quiere template editable por el usuario.

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

### Testing (hecho en esta sesión)
- [x] ~~Migración Karma → **Jest**~~ — `jest-preset-angular` + jsdom + `fake-indexeddb`. Corre sin browser (container y CI). `npm test` / `test:watch` / `test:coverage`. 27/40 suites verdes (47 tests).
- [x] ~~**Playwright** E2E~~ — `playwright.config.ts` + `e2e/*.spec.ts` + `.github/workflows/e2e.yaml`. Corre en CI (browser no levanta en el container).
- [ ] **Rehabilitar los 13 component specs stub** que aún fallan — son boilerplate del CLI nunca mantenido (mismo `NG0304: not a known element`; `app.component.spec` aún testea el `'cider app is running!'` default). Opciones: (a) arreglar cada TestBed con `NO_ERRORS_SCHEMA` + `HttpClientTestingModule`/`RouterTestingModule` + asserts reales, o (b) borrarlos (testean sólo `toBeTruthy` con setup roto). Decidir antes de cablear `npm test` al CI.
- [ ] Agregar workflow CI de unit tests (`npm test`) una vez resueltos los 13 stubs, para no arrancar con CI en rojo.

### Fase 7 (quality gates)
- [ ] `.eslintrc.json` (`@angular-eslint` + `@typescript-eslint`).
- [ ] `.prettierrc.json`.
- [ ] `.github/workflows/ci.yml` (lint + build; el test ya tiene su propio camino). Usar Node 20.
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
