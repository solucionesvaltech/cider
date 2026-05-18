import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { AppDB } from '../indexed-db/db';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { FieldType } from '../types/field-type.type';
import { Project } from '../types/project.type';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService extends IndexedDbService<Project, number> {
  static readonly DEFAULT_PROJECT_NAME = 'Default Project';
  selectedProject: BehaviorSubject<Project | undefined>;

  constructor(db: AppDB) {
    super(db, AppDB.PROJECTS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, required: true},
      {field: 'description', header: 'Description', type: FieldType.textArea},
      {field: 'storageBackend', header: 'Storage', type: FieldType.option,
        options: ['indexeddb', 'firebase'],
        description: 'Where this project lives. IndexedDB is local-only; Firebase syncs to the cloud.'},
      {field: 'createdAt', header: 'Created', type: FieldType.text, hidden: true}
    ]);
    this.selectedProject = new BehaviorSubject<Project | undefined>(undefined);
    this.bootstrapSelectedProject();
  }

  override getEntityName(entity: Project) {
    return entity.name;
  }

  public selectProject(project: Project | undefined) {
    if (this.selectedProject.getValue()?.id !== project?.id) {
      this.selectedProject.next(project);
    }
  }

  public getSelectedProject() {
    return this.selectedProject.asObservable();
  }

  /**
   * On first access, pick the first project as selected so existing
   * deck-scoped flows keep working without UI changes.
   */
  private async bootstrapSelectedProject() {
    try {
      const projects = await this.getAll();
      if (projects.length > 0 && !this.selectedProject.getValue()) {
        this.selectedProject.next(projects[0]);
      }
    } catch (err) {
      // db not ready yet on first construction; the v4 migration will populate
      // a default project and subsequent reads will resolve it.
    }
  }
}
