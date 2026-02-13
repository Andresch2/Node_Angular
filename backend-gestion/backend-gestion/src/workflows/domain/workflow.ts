import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class Workflow {
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
    type: String,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    type: String,
    nullable: false,
    description: 'Nombre del evento Inngest que dispara este workflow',
  })
  inngestEventName: string;

  @ApiProperty({
    type: Boolean,
    default: true,
    description: 'Si el workflow está activo',
  })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: () => User,
  })
  user?: User | null;
}
