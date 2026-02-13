import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { WorkflowNode } from '../../domain/workflow-node';

export abstract class WorkflowNodeRepository {
  abstract create(
    data: Omit<WorkflowNode, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<WorkflowNode>;

  abstract findByWorkflowId(workflowId: string): Promise<WorkflowNode[]>;

  abstract findById(
    id: WorkflowNode['id'],
  ): Promise<NullableType<WorkflowNode>>;

  abstract update(
    id: WorkflowNode['id'],
    payload: DeepPartial<WorkflowNode>,
  ): Promise<WorkflowNode | null>;

  abstract remove(id: WorkflowNode['id']): Promise<void>;
}
