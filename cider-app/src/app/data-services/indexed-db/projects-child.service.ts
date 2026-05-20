import { ProjectsService } from '../services/projects.service';
import { EntityField } from '../types/entity-field.type';
import { AppDB } from './db';
import { ParentScopedService } from './parent-scoped.service';

/**
 * Sibling to DecksChildService for entities that live at the Project
 * level (e.g. PrintTemplate). The parent foreign key is "projectId".
 */
export class ProjectsChildService<Entity, Identity extends string | number>
  extends ParentScopedService<Entity, Identity, number> {

  projectsService: ProjectsService;

  constructor(projectsService: ProjectsService, db: AppDB, tableName: string, fields?: EntityField<Entity>[]) {
    super(db, tableName, projectsService.getSelectedProject(), 'projectId', fields);
    this.projectsService = projectsService;
  }
}
