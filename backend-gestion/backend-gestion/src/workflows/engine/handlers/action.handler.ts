import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NodeHandler, WorkflowContext } from '../types';

/**
 * ActionHandler: Ejecuta acciones basadas en registros.
 * Lee los datos directamente de la BD usando el nombre de la tabla interna.

 */
@Injectable()
export class ActionHandler implements NodeHandler {
  private readonly logger = new Logger(ActionHandler.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) { }

  async execute(
    node: any,
    _context: WorkflowContext,
    _step: any,
  ): Promise<any> {
    const config = node.config || {};
    const nombre = config.nombre || 'Sin nombre';
    const json = config.json || {};
    const tableName: string = json.table || '';
    const fields: string[] = json.fields || [];
    const data: Record<string, any> = config.data || {};

    this.logger.log(
      `ActionHandler: ejecutando record "${nombre}" → tabla "${tableName}" en nodo ${node.id}`,
    );

    if (!tableName) {
      return {
        status: 'success',
        nombre,
        message: 'Sin tabla configurada. Selecciona una tabla en el editor.',
        data: json,
      };
    }

    try {
      // Filtrar datos vacíos del form
      const dataToInsert = Object.entries(data).reduce((acc, [key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          acc[key] = val;
        }
        return acc;
      }, {} as Record<string, any>);

      if (Object.keys(dataToInsert).length > 0) {
        // Ejecutar INSERT
        const keys = Object.keys(dataToInsert);
        const values = Object.values(dataToInsert);

        const columns = keys.map(k => `"${k}"`).join(', ');
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const insertQuery = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`;
        const result = await this.dataSource.query(insertQuery, values);

        // Si devuelve el registro insertado, lo adjuntamos como data
        const insertedRow = Array.isArray(result) && result.length > 0 ? result[0] : result;

        return {
          status: 'success',
          nombre,
          table: tableName,
          data: insertedRow,
          recordData: data,
        };
      } else {
        // Construir la proyección solo de campos seguros para SELECT
        const safeFields = fields.length > 0
          ? fields.map(f => `"${f}"`).join(', ')
          : '*';

        const query = `SELECT ${safeFields} FROM "${tableName}" LIMIT 100`;
        const rows = await this.dataSource.query(query);

        // Si no se proporcionaron datos, enviar los datos vacíos
        return {
          status: 'success',
          nombre,
          table: tableName,
          data: rows,
          recordData: data,
        };
      }
    } catch (error: any) {
      this.logger.error(
        `Error en ActionHandler record "${nombre}" (tabla: ${tableName}): ${error.message}`,
      );
      return {
        status: 'error',
        nombre,
        table: tableName,
        message: error.message,
      };
    }
  }
}
