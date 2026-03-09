import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { AuthGuard } from '../auth/auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('todo')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('todo')
export class TodoController {
    constructor(private readonly todoService: TodoService) { }

    @Get('my')
    @ApiOperation({ summary: 'Get my incomplete todos across all modules' })
    async getMyTodos(@Req() req: any) {
        return await this.todoService.getMyTodos(req.user.sub);
    }
}
