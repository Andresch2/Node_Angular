import { Injectable, Logger } from '@nestjs/common';
import { NodeHandler, WorkflowContext } from '../types';

/**
 * ActionHandler: Ejecuta acciones genéricas extensibles.
 * Configuración esperada en node.config:
 *   { action: string, params?: any }
 * Acciones predefinidas:
 *   - 'log': registra mensaje en logs
 *   - 'transform': transforma datos del contexto
 *   - default: registra la acción y continúa
 */
@Injectable()
export class ActionHandler implements NodeHandler {
  private readonly logger = new Logger(ActionHandler.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async execute(
    node: any,
    _context: WorkflowContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _step: any,
  ): Promise<any> {
    const config = node.config || {};
    const action = config.action || 'default';
    const params = config.params || {};

    this.logger.log(
      `ActionHandler: ejecutando acción "${action}" en nodo ${node.id}`,
    );

    switch (action) {
      case 'log':
        this.logger.log(`ActionHandler LOG: ${JSON.stringify(params)}`);
        return {
          status: 'success',
          action: 'log',
          message: params.message || 'logged',
        };

      case 'transform':
        // Ejemplo: transformar datos del contexto
        return {
          status: 'success',
          action: 'transform',
          data: { ..._context, ...params },
        };

      default:
        this.logger.log(
          `ActionHandler: acción genérica "${action}" completada`,
        );
        return { status: 'success', action, params };
    }
  }
}
