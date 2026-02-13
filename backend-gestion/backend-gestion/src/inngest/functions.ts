import { WorkflowsService } from '../workflows/workflows.service';
import { inngest } from './client';

interface InngestDependencies {
  workflowsService: WorkflowsService;
}

/**
 * Factory que recibe dependencias de NestJS y retorna las funciones Inngest.
 * Se llama desde main.ts después de que la app NestJS esté inicializada.
 */
export function getInngestFunctions({ workflowsService }: InngestDependencies) {
  // Función genérica que ejecuta un workflow por su ID
  const executeWorkflow = inngest.createFunction(
    { id: 'workflow-executor', name: 'Ejecutar Workflow' },
    { event: 'workflow/execute' },
    async ({ event, step }) => {
      const workflowId = event.data?.workflowId as string;

      if (!workflowId) {
        throw new Error('Missing workflowId in event data');
      }

      // Step 1: Cargar el workflow desde la BD
      const workflow = await step.run('load-workflow', async () => {
        const wf = await workflowsService.findById(workflowId);
        if (!wf) {
          throw new Error(`Workflow ${workflowId} no encontrado`);
        }
        return wf;
      });

      // Step 2: Cargar los nodos del workflow
      const nodes = await step.run('load-nodes', async () => {
        return workflowsService.findNodesByWorkflowId(workflowId);
      });

      // Step 3: Ejecutar cada nodo secuencialmente
      const results: Record<string, any>[] = [];
      for (const node of nodes) {
        const result = await step.run(
          `execute-node-${node.position}-${node.name}`,
          () => {
            // Aquí se puede agregar lógica según el tipo de nodo
            switch (node.type) {
              case 'ACTION':
                return {
                  nodeId: node.id,
                  name: node.name,
                  status: 'completed',
                  config: node.config,
                };
              case 'CONDITION':
                return {
                  nodeId: node.id,
                  name: node.name,
                  status: 'evaluated',
                  config: node.config,
                };
              case 'DELAY':
                return {
                  nodeId: node.id,
                  name: node.name,
                  status: 'waited',
                  config: node.config,
                };
              case 'NOTIFICATION':
                return {
                  nodeId: node.id,
                  name: node.name,
                  status: 'notified',
                  config: node.config,
                };
              default:
                return {
                  nodeId: node.id,
                  name: node.name,
                  status: 'unknown',
                };
            }
          },
        );
        results.push(result);
      }

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodesExecuted: results.length,
        results,
      };
    },
  );

  return [executeWorkflow];
}
