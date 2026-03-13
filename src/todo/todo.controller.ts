import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('할 일 (To-Do)')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('todo')
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Get('my')
    @ApiOperation({ summary: '내 할 일(To-Do) 목록 조회', description: '로그인한 사용자가 처리해야 할 통합된 전체 할 일(To-Do) 목록을 조회합니다.' })
    @ApiResponse({ status: 200, description: '할 일 목록 조회 성공' })
    async getMyTodos(@Req() req: any) {
        return await this.todoService.getMyTodos(req.user.sub);
    }
}
