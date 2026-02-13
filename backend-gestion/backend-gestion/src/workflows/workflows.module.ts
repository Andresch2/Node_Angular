import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { RelationalWorkflowPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [
    // do not remove this comment
    RelationalWorkflowPersistenceModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService, RelationalWorkflowPersistenceModule],
})
export class WorkflowsModule {}
