import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/project.model';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  getTasks(page: number = 1, limit: number = 100, projectId?: string): Observable<PaginatedResponse<Task>> {
    let url = `${this.API_URL}/tasks?page=${page}&limit=${limit}`;
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    return this.http.get<PaginatedResponse<Task>>(url);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task);
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`);
  }
}