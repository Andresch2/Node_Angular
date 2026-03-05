import {
    Body,
    Controller,
    Headers,
    Logger,
    Param,
    Post,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { inngest } from '../inngest/client';
import { WorkflowsService } from './workflows.service';

/**
 * WebhookController — Endpoint PÚBLICO (sin JWT).
 *
 * Recibe webhooks de sistemas externos (Shopify, Github, etc.)
 * y dispara la ejecución del workflow correspondiente vía Inngest.
 */
@ApiTags('Webhooks')
@Controller({
    path: 'workflows/webhook',
    version: '1',
})
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);

    constructor(private readonly workflowsService: WorkflowsService) { }

    @Post(':workflowId')
    @ApiParam({ name: 'workflowId', type: String })
    async receiveWebhook(
        @Param('workflowId') workflowId: string,
        @Body() payload: Record<string, any>,
        @Headers() headers: Record<string, string>,
    ) {
        this.logger.log(`Webhook recibido para workflow: ${workflowId}`);

        // Verificar que el workflow existe
        const workflow = await this.workflowsService.findById(workflowId);
        if (!workflow) {
            this.logger.warn(`Workflow ${workflowId} no encontrado`);
            return { status: 'error', message: `Workflow ${workflowId} no encontrado` };
        }

        // Enviar evento a Inngest para ejecutar el workflow
        await inngest.send({
            name: 'webhook.received',
            data: {
                workflowId,
                payload,
                headers: {
                    'content-type': headers['content-type'],
                    'user-agent': headers['user-agent'],
                    'x-webhook-secret': headers['x-webhook-secret'],
                },
            },
        });

        this.logger.log(`Evento webhook.received enviado a Inngest para workflow ${workflowId}`);
        return { status: 'received', workflowId };
    }
}
