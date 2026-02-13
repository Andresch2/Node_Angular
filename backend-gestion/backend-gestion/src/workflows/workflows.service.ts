import {
  // common
  Injectable,
} from '@nestjs/common';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Workflow } from './domain/workflow';
import { WorkflowNode } from './domain/workflow-node';
import { CreateWorkflowNodeDto } from './dto/create-workflow-node.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowNodeDto } from './dto/update-workflow-node.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowNodeRepository } from './infrastructure/persistence/workflow-node.repository';
import { WorkflowRepository } from './infrastructure/persistence/workflow.repository';

@Injectable()
export class WorkflowsService {
  constructor(
    // Dependencies here
    private readonly workflowRepository: WorkflowRepository,
    private readonly workflowNodeRepository: WorkflowNodeRepository,
  ) {}

  // ========== Workflow CRUD ==========

  async create(createWorkflowDto: CreateWorkflowDto, user: Workflow['user']) {
    return this.workflowRepository.create({
      name: createWorkflowDto.name,
      description: createWorkflowDto.description,
      inngestEventName: createWorkflowDto.inngestEventName,
      isActive: createWorkflowDto.isActive ?? true,
      user: user,
    });
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.workflowRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Workflow['id']) {
    return this.workflowRepository.findById(id);
  }

  findByIds(ids: Workflow['id'][]) {
    return this.workflowRepository.findByIds(ids);
  }

  async update(id: Workflow['id'], updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowRepository.update(id, {
      name: updateWorkflowDto.name,
      description: updateWorkflowDto.description,
      inngestEventName: updateWorkflowDto.inngestEventName,
      isActive: updateWorkflowDto.isActive,
    });
  }

  remove(id: Workflow['id']) {
    return this.workflowRepository.remove(id);
  }

  // ========== WorkflowNode CRUD ==========

  async createNode(createWorkflowNodeDto: CreateWorkflowNodeDto) {
    return this.workflowNodeRepository.create({
      name: createWorkflowNodeDto.name,
      type: createWorkflowNodeDto.type,
      config: createWorkflowNodeDto.config,
      position: createWorkflowNodeDto.position,
      workflowId: createWorkflowNodeDto.workflowId,
    });
  }

  findNodesByWorkflowId(workflowId: string) {
    return this.workflowNodeRepository.findByWorkflowId(workflowId);
  }

  findNodeById(id: WorkflowNode['id']) {
    return this.workflowNodeRepository.findById(id);
  }

  async updateNode(
    id: WorkflowNode['id'],
    updateWorkflowNodeDto: UpdateWorkflowNodeDto,
  ) {
    return this.workflowNodeRepository.update(id, {
      name: updateWorkflowNodeDto.name,
      type: updateWorkflowNodeDto.type,
      config: updateWorkflowNodeDto.config,
      position: updateWorkflowNodeDto.position,
    });
  }

  removeNode(id: WorkflowNode['id']) {
    return this.workflowNodeRepository.remove(id);
  }
}
