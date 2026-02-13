import {
  // common
  Injectable,
} from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Project } from './domain/project';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectRepository } from './infrastructure/persistence/project.repository';

@Injectable()
export class ProjectsService {
  constructor(
    // Dependencies here
    private readonly projectRepository: ProjectRepository,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.projectRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      endDate: createProjectDto.endDate,

      startDate: createProjectDto.startDate,

      description: createProjectDto.description,

      name: createProjectDto.name,
    });
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.projectRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Project['id']) {
    return this.projectRepository.findById(id);
  }

  findByIds(ids: Project['id'][]) {
    return this.projectRepository.findByIds(ids);
  }

  async update(
    id: Project['id'],

    updateProjectDto: UpdateProjectDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.projectRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      endDate: updateProjectDto.endDate,

      startDate: updateProjectDto.startDate,

      description: updateProjectDto.description,

      name: updateProjectDto.name,
    });
  }

  remove(id: Project['id']) {
    return this.projectRepository.remove(id);
  }
}
