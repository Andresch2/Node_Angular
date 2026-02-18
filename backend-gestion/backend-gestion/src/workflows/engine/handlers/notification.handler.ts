import { Injectable, Logger } from '@nestjs/common';
import { NodeHandler, WorkflowContext } from '../types';

@Injectable()
export class NotificationHandler implements NodeHandler {
    private readonly logger = new Logger(NotificationHandler.name);

    async execute(node: any, context: WorkflowContext, step: any): Promise<any> {
        const message = node.config?.message || 'Sin mensaje';
        const recipient = node.config?.recipient || 'Sin destinatario';

        this.logger.log(
            `[Notificación] Para: ${recipient} - Mensaje: "${message}"`,
        );

        // Simular un delay o llamada externa si fuera real
        // await new Promise(resolve => setTimeout(resolve, 500));

        return {
            status: 'sent',
            recipient,
            message,
            timestamp: new Date().toISOString(),
        };
    }
}
