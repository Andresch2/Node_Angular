import { PartialType } from '@nestjs/swagger';
import { CreateWorkflowNodeDto } from './create-workflow-node.dto';

export class UpdateWorkflowNodeDto extends PartialType(CreateWorkflowNodeDto) {}
