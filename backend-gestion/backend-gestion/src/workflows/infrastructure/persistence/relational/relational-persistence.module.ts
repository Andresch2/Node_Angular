import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowNodeRepository } from '../workflow-node.repository';
import { WorkflowRepository } from '../workflow.repository';
import { WorkflowNodeEntity } from './entities/workflow-node.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowNodeRelationalRepository } from './repositories/workflow-node.repository';
import { WorkflowRelationalRepository } from './repositories/workflow.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, WorkflowNodeEntity])],
  providers: [
    {
      provide: WorkflowRepository,
      useClass: WorkflowRelationalRepository,
    },
    {
      provide: WorkflowNodeRepository,
      useClass: WorkflowNodeRelationalRepository,
    },
  ],
  exports: [WorkflowRepository, WorkflowNodeRepository],
})
export class RelationalWorkflowPersistenceModule {}
