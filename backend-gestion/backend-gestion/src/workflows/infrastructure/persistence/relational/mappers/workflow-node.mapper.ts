import { WorkflowNode } from '../../../../domain/workflow-node';
import { WorkflowNodeEntity } from '../entities/workflow-node.entity';

export class WorkflowNodeMapper {
  static toDomain(raw: WorkflowNodeEntity): WorkflowNode {
    const domainEntity = new WorkflowNode();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.type = raw.type;
    domainEntity.config = raw.config;
    domainEntity.position = raw.position;
    domainEntity.workflowId = raw.workflowId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: WorkflowNode): WorkflowNodeEntity {
    const persistenceEntity = new WorkflowNodeEntity();
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.type = domainEntity.type;
    persistenceEntity.config = domainEntity.config;
    persistenceEntity.position = domainEntity.position;
    persistenceEntity.workflowId = domainEntity.workflowId;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
