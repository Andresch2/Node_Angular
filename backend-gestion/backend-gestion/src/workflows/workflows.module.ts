import { Module } from '@nestjs/common';
import { ActionHandler } from './engine/handlers/action.handler';
import { DelayHandler } from './engine/handlers/delay.handler';
import { HttpHandler } from './engine/handlers/http.handler';
import { NotificationHandler } from './engine/handlers/notification.handler';
import { WebhookHandler } from './engine/handlers/webhook.handler';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { RelationalWorkflowPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [RelationalWorkflowPersistenceModule],
  controllers: [WorkflowsController],
  providers: [
    WorkflowsService,
    WorkflowEngineService,
    HttpHandler,
    WebhookHandler,
    ActionHandler,
    DelayHandler,
    NotificationHandler,
  ],
  exports: [WorkflowsService, WorkflowEngineService],
})
export class WorkflowsModule { }
