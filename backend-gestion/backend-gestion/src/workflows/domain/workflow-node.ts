import { ApiProperty } from '@nestjs/swagger';

export enum WorkflowNodeType {
  ACTION = 'ACTION',
  CONDITION = 'CONDITION',
  DELAY = 'DELAY',
  NOTIFICATION = 'NOTIFICATION',
}

export class WorkflowNode {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
    nullable: false,
  })
  name: string;

  @ApiProperty({
    enum: WorkflowNodeType,
    example: WorkflowNodeType.ACTION,
    description: 'Tipo de nodo del workflow',
  })
  type: WorkflowNodeType;

  @ApiProperty({
    type: Object,
    nullable: true,
    description: 'Configuración JSON del nodo (parámetros, duración, etc.)',
  })
  config?: Record<string, any> | null;

  @ApiProperty({
    type: Number,
    description: 'Orden de ejecución en el workflow',
  })
  position: number;

  @ApiProperty({
    type: String,
    description: 'ID del workflow asociado',
  })
  workflowId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
