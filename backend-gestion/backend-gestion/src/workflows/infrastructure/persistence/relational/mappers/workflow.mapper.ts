import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Workflow } from '../../../../domain/workflow';
import { WorkflowEntity } from '../entities/workflow.entity';

export class WorkflowMapper {
  static toDomain(raw: WorkflowEntity): Workflow {
    const domainEntity = new Workflow();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.inngestEventName = raw.inngestEventName;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Workflow): WorkflowEntity {
    const persistenceEntity = new WorkflowEntity();
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.inngestEventName = domainEntity.inngestEventName;
    persistenceEntity.isActive = domainEntity.isActive;
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    if (domainEntity.user) {
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user);
    }

    return persistenceEntity;
  }
}
