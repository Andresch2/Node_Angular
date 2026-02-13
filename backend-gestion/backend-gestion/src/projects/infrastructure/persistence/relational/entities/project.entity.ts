import { TaskEntity } from 'src/tasks/infrastructure/persistence/relational/entities/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'project',
})
export class ProjectEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: String,
  })
  name: string;

  @Column({
    nullable: true,
    type: String,
  })
  description?: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  startDate?: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  endDate?: string | null;

  // Relación con Tasks (One-to-Many)
  @OneToMany(() => TaskEntity, (task: TaskEntity) => task.project, {
    cascade: true,
  })
  tasks?: TaskEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
