import { ApiProperty } from '@nestjs/swagger';
import { Project } from '../../projects/domain/project';
import { User } from '../../users/domain/user';

export class Workflow {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String, nullable: true })
  description?: string | null;

  @ApiProperty({
    type: String,
    enum: ['webhook', 'http'],
    description: 'Tipo de trigger del workflow',
  })
  triggerType: 'webhook' | 'http';

  @ApiProperty({ type: () => User })
  user?: User | null;

  @ApiProperty({ type: () => Project })
  project?: Project | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
