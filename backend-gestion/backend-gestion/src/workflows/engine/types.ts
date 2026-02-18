export interface WorkflowContext {
  workflowId: string;
  [key: string]: any;
}

export interface NodeHandler {
  execute(node: any, context: WorkflowContext, step: any): Promise<any>;
}
