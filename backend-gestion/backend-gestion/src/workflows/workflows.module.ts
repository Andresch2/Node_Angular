import { Module } from '@nestjs/common';
import { ActionHandler } from './engine/handlers/action.handler';
import { DelayHandler } from './engine/handlers/delay.handler';
import { FormHandler } from './engine/handlers/form.handler';
import { HttpHandler } from './engine/handlers/http.handler';
import { NotificationHandler } from './engine/handlers/notification.handler';
import { WebhookHandler } from './engine/handlers/webhook.handler';
import { TemplateUtil } from './engine/utils/template.util';
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
    FormHandler,
    TemplateUtil,
  ],
  exports: [WorkflowsService, WorkflowEngineService, TemplateUtil],
})
export class WorkflowsModule { }
