import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowNodeRepository } from '../workflow-node.repository';
import { WorkflowRepository } from '../workflow.repository';
import { WorkflowNodeEntity } from './entities/workflow-node.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import { RelationalWorkflowNodeRepository } from './repositories/workflow-node.repository';
import { RelationalWorkflowRepository } from './repositories/workflow.repository';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, WorkflowNodeEntity])],
  providers: [
    {
      provide: WorkflowRepository,
      useClass: RelationalWorkflowRepository,
    },
    {
      provide: WorkflowNodeRepository,
      useClass: RelationalWorkflowNodeRepository,
    },
  ],
  exports: [WorkflowRepository, WorkflowNodeRepository],
})
export class RelationalWorkflowPersistenceModule {}
