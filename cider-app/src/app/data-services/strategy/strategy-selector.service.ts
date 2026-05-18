import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectsService } from '../services/projects.service';
import { Project, StorageBackend } from '../types/project.type';

/**
 * Resolves which storage backend the *currently selected* Project uses.
 * Today only IndexedDB is wired; the Firebase backend will register
 * itself here once Phase 6 lands. Consumers that need to swap behaviour
 * per project (e.g. the future Firestore implementations of
 * EntityService) can subscribe to currentBackend$ and react.
 *
 * Concrete EntityService instances do NOT need to consult this service
 * yet — every existing service is IndexedDB-only, and the Project entity
 * is still informational. Once Firebase lands this selector decides
 * whether a service delegates to IndexedDbService or FirestoreService.
 */
@Injectable({
  providedIn: 'root'
})
export class StrategySelectorService {
  readonly currentBackend$: Observable<StorageBackend>;

  constructor(private projectsService: ProjectsService) {
    this.currentBackend$ = this.projectsService.getSelectedProject().pipe(
      map((project: Project | undefined) => project?.storageBackend || 'indexeddb')
    );
  }

  /**
   * Convenience snapshot helper. Defaults to 'indexeddb' when nothing
   * is selected yet (which happens during the very first app boot
   * before the default project bootstraps).
   */
  currentBackend(project?: Project): StorageBackend {
    return project?.storageBackend || 'indexeddb';
  }
}
