import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ example: 'Mi Workflow actualizado' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción' })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({ enum: ['webhook', 'http'] })
  @IsEnum(['webhook', 'http'], {
    message: 'triggerType debe ser webhook o http',
  })
  @IsOptional()
  triggerType?: 'webhook' | 'http';
}
