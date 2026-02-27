import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { inngest } from '../inngest/client';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { Workflow } from './domain/workflow';
import { WorkflowNode } from './domain/workflow-node';
import { CreateWorkflowNodeDto } from './dto/create-workflow-node.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { FindAllWorkflowsDto } from './dto/find-all-workflows.dto';
import { UpdateWorkflowNodeDto } from './dto/update-workflow-node.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowsService } from './workflows.service';

@ApiTags('Workflows')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'workflows',
  version: '1',
})
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) { }

  // ==================== Workflow Endpoints ====================

  @Post()
  @ApiCreatedResponse({ type: Workflow })
  create(@Body() dto: CreateWorkflowDto, @Request() request) {
    return this.workflowsService.create(dto, request.user);
  }

  @Get()
  @ApiOkResponse({ type: InfinityPaginationResponse(Workflow) })
  async findAll(
    @Request() request,
    @Query() query: FindAllWorkflowsDto,
  ): Promise<InfinityPaginationResponseDto<Workflow>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) limit = 50;

    const result = await this.workflowsService.findAllWithPagination({
      paginationOptions: { page, limit },
      user: request.user,
    });

    return infinityPagination(result.data, { page, limit }, result.total);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Workflow })
  findById(@Param('id') id: string) {
    return this.workflowsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: Workflow })
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  // ==================== Execution Endpoints ====================

  @Post(':id/execute')
  @ApiParam({ name: 'id', type: String })
  async execute(@Param('id') id: string, @Body() payload: Record<string, any>) {
    console.log(`Intentando ejecutar workflow: ${id}`);
    try {
      await inngest.send({
        name: 'workflow/execute',
        data: { workflowId: id, ...payload },
      });
      console.log('Evento enviado exitosamente a Inngest');
      return { message: 'Workflow execution initiated', workflowId: id };
    } catch (error) {
      console.error('Error enviando evento a Inngest:', error);
      throw error;
    }
  }

  @Post('webhook/:id')
  @ApiParam({ name: 'id', type: String })
  async webhook(@Param('id') id: string, @Body() payload: Record<string, any>) {
    await inngest.send({
      name: 'webhook.received',
      data: { workflowId: id, payload },
    });
    return { status: 'received', workflowId: id };
  }

  // ==================== WorkflowNode Endpoints ====================

  @Post('nodes')
  @ApiCreatedResponse({ type: WorkflowNode })
  createNode(@Body() dto: CreateWorkflowNodeDto) {
    return this.workflowsService.createNode(dto);
  }

  @Get(':workflowId/nodes')
  @ApiParam({ name: 'workflowId', type: String })
  @ApiOkResponse({ type: [WorkflowNode] })
  findNodesByWorkflowId(@Param('workflowId') workflowId: string) {
    return this.workflowsService.findNodesByWorkflowId(workflowId);
  }

  @Get('nodes/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WorkflowNode })
  findNodeById(@Param('id') id: string) {
    return this.workflowsService.findNodeById(id);
  }

  @Patch('nodes/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: WorkflowNode })
  updateNode(@Param('id') id: string, @Body() dto: UpdateWorkflowNodeDto) {
    return this.workflowsService.updateNode(id, dto);
  }

  @Delete('nodes/:id')
  @ApiParam({ name: 'id', type: String })
  removeNode(@Param('id') id: string) {
    return this.workflowsService.removeNode(id);
  }

  // ==================== Testing Endpoints ====================

  @Post('test/action')
  async testActionNode(@Body() dto: { nombre?: string; endpoint?: string; json?: any }) {
    return this.workflowsService.testAction(dto);
  }

  @Post('test/http')
  async testHttpNode(@Body() dto: { method: string, url: string, headers?: any, body?: any }) {
    try {
      const { method = 'GET', url, headers = {}, body } = dto;

      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' && body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      return { statusCode: response.status, data };
    } catch (error: any) {
      return { statusCode: 500, error: error.message };
    }
  }
}
