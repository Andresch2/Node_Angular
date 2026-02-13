import { ApiProperty } from '@nestjs/swagger';

export class Project {
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
    nullable: true,
  })
  startDate?: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  endDate?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
