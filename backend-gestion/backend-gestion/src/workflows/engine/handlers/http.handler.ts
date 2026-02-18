import { Injectable, Logger } from '@nestjs/common';
import { NodeHandler, WorkflowContext } from '../types';

/**
 * HttpHandler: Realiza peticiones HTTP externas (GET/POST).
 * Configuración esperada en node.config:
 *   { url: string, method?: 'GET' | 'POST', headers?: object, body?: any }
 */
@Injectable()
export class HttpHandler implements NodeHandler {
  private readonly logger = new Logger(HttpHandler.name);

  async execute(
    node: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: WorkflowContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _step: any,
  ): Promise<any> {
    const config = node.config || {};
    const url = config.url;
    const method = (config.method || 'POST').toUpperCase();
    const headers = config.headers || { 'Content-Type': 'application/json' };
    const body = config.body || {};

    if (!url) {
      this.logger.warn(`HttpHandler: nodo ${node.id} sin URL configurada`);
      return { status: 'skipped', reason: 'No URL' };
    }

    this.logger.log(`HttpHandler: ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      const data = await response.text();
      return { status: 'success', statusCode: response.status, data };
    } catch (error) {
      this.logger.error(`HttpHandler error: ${error.message}`);
      return { status: 'failed', error: error.message };
    }
  }
}
