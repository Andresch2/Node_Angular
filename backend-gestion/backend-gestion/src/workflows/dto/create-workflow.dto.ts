import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Mi Workflow' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descripción del workflow', required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ enum: ['webhook', 'http'], example: 'webhook' })
  @IsEnum(['webhook', 'http'], {
    message: 'triggerType debe ser webhook o http',
  })
  @IsNotEmpty()
  triggerType: 'webhook' | 'http';

  @ApiProperty({ example: 'uuid-del-proyecto', required: false })
  @IsUUID()
  @IsOptional()
  projectId?: string;
}
