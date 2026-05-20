// Polyfill IndexedDB for jsdom so Dexie-backed services (AppDB and
// everything built on it) can be exercised in unit tests.
import 'fake-indexeddb/auto';
import 'jest-preset-angular/setup-jest';
