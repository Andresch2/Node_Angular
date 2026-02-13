import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProjectDto, PaginatedResponse, Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly API_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  getProjects(page: number = 1, limit: number = 10): Observable<PaginatedResponse<Project>> {
    return this.http.get<PaginatedResponse<Project>>(
      `${this.API_URL}/projects?page=${page}&limit=${limit}`
    );
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.API_URL}/projects/${id}`);
  }

  createProject(project: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/projects`, project);
  }

  updateProject(id: string, project: Partial<CreateProjectDto>): Observable<Project> {
    return this.http.patch<Project>(`${this.API_URL}/projects/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/projects/${id}`);
  }
}