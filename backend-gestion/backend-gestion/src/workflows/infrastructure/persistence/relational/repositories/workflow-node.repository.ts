import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { WorkflowNode } from '../../../../domain/workflow-node';
import { WorkflowNodeRepository } from '../../workflow-node.repository';
import { WorkflowNodeEntity } from '../entities/workflow-node.entity';
import { WorkflowNodeMapper } from '../mappers/workflow-node.mapper';

@Injectable()
export class WorkflowNodeRelationalRepository
  implements WorkflowNodeRepository
{
  constructor(
    @InjectRepository(WorkflowNodeEntity)
    private readonly workflowNodeRepository: Repository<WorkflowNodeEntity>,
  ) {}

  async create(data: WorkflowNode): Promise<WorkflowNode> {
    const persistenceModel = WorkflowNodeMapper.toPersistence(data);
    const newEntity = await this.workflowNodeRepository.save(
      this.workflowNodeRepository.create(persistenceModel),
    );
    return WorkflowNodeMapper.toDomain(newEntity);
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowNode[]> {
    const entities = await this.workflowNodeRepository.find({
      where: { workflowId },
      order: { position: 'ASC' },
    });

    return entities.map((entity) => WorkflowNodeMapper.toDomain(entity));
  }

  async findById(id: WorkflowNode['id']): Promise<NullableType<WorkflowNode>> {
    const entity = await this.workflowNodeRepository.findOne({
      where: { id },
    });

    return entity ? WorkflowNodeMapper.toDomain(entity) : null;
  }

  async update(
    id: WorkflowNode['id'],
    payload: Partial<WorkflowNode>,
  ): Promise<WorkflowNode> {
    const entity = await this.workflowNodeRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.workflowNodeRepository.save(
      this.workflowNodeRepository.create(
        WorkflowNodeMapper.toPersistence({
          ...WorkflowNodeMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return WorkflowNodeMapper.toDomain(updatedEntity);
  }

  async remove(id: WorkflowNode['id']): Promise<void> {
    await this.workflowNodeRepository.delete(id);
  }
}
