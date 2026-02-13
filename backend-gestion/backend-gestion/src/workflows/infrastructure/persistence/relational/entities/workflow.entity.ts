import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { WorkflowNodeEntity } from './workflow-node.entity';

@Entity({
  name: 'workflow',
})
export class WorkflowEntity extends EntityRelationalHelper {
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
    nullable: false,
    type: String,
  })
  inngestEventName: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  // Relación con WorkflowNodes (One-to-Many)
  @OneToMany(
    () => WorkflowNodeEntity,
    (node: WorkflowNodeEntity) => node.workflow,
    {
      cascade: true,
    },
  )
  nodes?: WorkflowNodeEntity[];

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  user?: UserEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
