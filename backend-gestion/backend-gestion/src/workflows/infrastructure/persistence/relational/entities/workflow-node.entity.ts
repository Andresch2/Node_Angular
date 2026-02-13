import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { WorkflowNodeType } from '../../../../domain/workflow-node';
import { WorkflowEntity } from './workflow.entity';

@Entity({
  name: 'workflow_node',
})
export class WorkflowNodeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: String,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: WorkflowNodeType,
    default: WorkflowNodeType.ACTION,
    nullable: false,
  })
  type: WorkflowNodeType;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  config?: Record<string, any> | null;

  @Column({
    type: 'int',
    default: 0,
  })
  position: number;

  @Column({
    nullable: false,
    type: String,
  })
  workflowId: string;

  // Relación con Workflow (Many-to-One)
  @ManyToOne(
    () => WorkflowEntity,
    (workflow: WorkflowEntity) => workflow.nodes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workflowId' })
  workflow: WorkflowEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
