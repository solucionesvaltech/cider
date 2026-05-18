import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ProjectsService } from '../data-services/services/projects.service';
import { Project } from '../data-services/types/project.type';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  selectedProject: Project | Project[] | undefined;

  constructor(public projectsService: ProjectsService,
    private router: Router) { }

  ngOnInit(): void {
    this.projectsService.getSelectedProject().pipe(take(1)).subscribe(p => {
      this.selectedProject = p;
    });
  }

  public selectProject(): void {
    if (!this.selectedProject || Array.isArray(this.selectedProject)) {
      return;
    }
    this.projectsService.selectProject(this.selectedProject);
    this.router.navigateByUrl('/decks');
  }
}
