import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkflowNodeType } from '../domain/workflow-node';

export class CreateWorkflowNodeDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'Enviar notificación',
    description: 'Nombre del nodo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    enum: WorkflowNodeType,
    example: WorkflowNodeType.ACTION,
    description: 'Tipo de nodo del workflow',
  })
  @IsEnum(WorkflowNodeType)
  @IsNotEmpty()
  type: WorkflowNodeType;

  @ApiProperty({
    required: false,
    type: Object,
    example: { action: 'sendEmail', to: 'admin@example.com' },
    description: 'Configuración JSON del nodo',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any> | null;

  @ApiProperty({
    required: true,
    type: Number,
    example: 1,
    description: 'Orden de ejecución en el workflow',
  })
  @IsNumber()
  position: number;

  @ApiProperty({
    required: true,
    type: String,
    description: 'ID del workflow asociado',
  })
  @IsString()
  @IsNotEmpty()
  workflowId: string;
}
