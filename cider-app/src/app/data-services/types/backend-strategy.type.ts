import { EntityService } from './entity-service.type';

/**
 * Alias for EntityService used at the strategy boundary. Every concrete
 * backend (IndexedDB, Firebase, etc.) implements this and is chosen at
 * runtime by the StrategySelectorService based on the active Project.
 *
 * Kept as a type alias (not an extending interface) so existing
 * implementations of EntityService remain compatible without changes.
 */
export type BackendStrategy<Entity, Identity extends string | number> =
  EntityService<Entity, Identity>;
