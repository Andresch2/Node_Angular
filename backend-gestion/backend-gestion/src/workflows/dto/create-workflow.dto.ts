import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkflowDto {
  @ApiProperty({
    required: true,
    type: String,
    example: 'Workflow de aprobación',
    description: 'Nombre del workflow',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    type: String,
    example: 'Workflow para aprobar solicitudes de compra',
    description: 'Descripción del workflow',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    required: true,
    type: String,
    example: 'workflow/approval.requested',
    description: 'Nombre del evento Inngest que dispara este workflow',
  })
  @IsString()
  @IsNotEmpty()
  inngestEventName: string;

  @ApiProperty({
    required: false,
    type: Boolean,
    default: true,
    description: 'Si el workflow está activo',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
