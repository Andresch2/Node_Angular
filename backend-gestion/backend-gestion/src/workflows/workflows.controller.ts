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
  constructor(private readonly workflowsService: WorkflowsService) {}

  // ========== Workflow endpoints ==========

  @Post()
  @ApiCreatedResponse({
    type: Workflow,
  })
  create(@Body() createWorkflowDto: CreateWorkflowDto, @Request() request) {
    return this.workflowsService.create(createWorkflowDto, request.user);
  }

  @Get()
  @ApiOkResponse({
    type: InfinityPaginationResponse(Workflow),
  })
  async findAll(
    @Query() query: FindAllWorkflowsDto,
  ): Promise<InfinityPaginationResponseDto<Workflow>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    const result = await this.workflowsService.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
    });

    return infinityPagination(result.data, { page, limit }, result.total);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Workflow,
  })
  findById(@Param('id') id: string) {
    return this.workflowsService.findById(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Workflow,
  })
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }

  // ========== WorkflowNode endpoints ==========

  @Post('nodes')
  @ApiCreatedResponse({
    type: WorkflowNode,
  })
  createNode(@Body() createWorkflowNodeDto: CreateWorkflowNodeDto) {
    return this.workflowsService.createNode(createWorkflowNodeDto);
  }

  @Get(':workflowId/nodes')
  @ApiParam({
    name: 'workflowId',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: [WorkflowNode],
  })
  findNodesByWorkflowId(@Param('workflowId') workflowId: string) {
    return this.workflowsService.findNodesByWorkflowId(workflowId);
  }

  @Get('nodes/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: WorkflowNode,
  })
  findNodeById(@Param('id') id: string) {
    return this.workflowsService.findNodeById(id);
  }

  @Patch('nodes/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: WorkflowNode,
  })
  updateNode(
    @Param('id') id: string,
    @Body() updateWorkflowNodeDto: UpdateWorkflowNodeDto,
  ) {
    return this.workflowsService.updateNode(id, updateWorkflowNodeDto);
  }

  @Delete('nodes/:id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  removeNode(@Param('id') id: string) {
    return this.workflowsService.removeNode(id);
  }
}
