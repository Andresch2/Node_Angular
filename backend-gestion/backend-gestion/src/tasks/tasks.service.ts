import {
  // common
  Injectable,
} from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Task } from './domain/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskRepository } from './infrastructure/persistence/task.repository';

@Injectable()
export class TasksService {
  constructor(
    // Dependencies here
    private readonly taskRepository: TaskRepository,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.taskRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      status: createTaskDto.status,

      description: createTaskDto.description,

      title: createTaskDto.title,

      projectId: createTaskDto.projectId,
    });
  }

  findAllWithPagination({
    paginationOptions,
    projectId,
  }: {
    paginationOptions: IPaginationOptions;
    projectId?: string;
  }) {
    return this.taskRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
      projectId,
    });
  }

  findById(id: Task['id']) {
    return this.taskRepository.findById(id);
  }

  findByIds(ids: Task['id'][]) {
    return this.taskRepository.findByIds(ids);
  }

  async update(
    id: Task['id'],

    updateTaskDto: UpdateTaskDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.taskRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      status: updateTaskDto.status,

      description: updateTaskDto.description,

      title: updateTaskDto.title,

      projectId: updateTaskDto.projectId,
    });
  }

  remove(id: Task['id']) {
    return this.taskRepository.remove(id);
  }
}
