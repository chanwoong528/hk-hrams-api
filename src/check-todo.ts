import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TodoService } from './todo/todo.service';
import { HramsUserService } from './hrams-user/hrams-user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const hramsUserService = app.get(HramsUserService);
  const todoService = app.get(TodoService);

  // Use the team member's email or ID depicted in the screenshot, or just one we know has 0/2 goals.
  // We'll search for '남유진' or '이창재' or '문찬웅' as they were in the list.
  const testUser = await hramsUserService.getHramsUserByEmail('junsik@hankookilbo.com');
  console.log('Test User:', testUser?.koreanName, testUser?.userId);

  if (testUser) {
    const todos = await todoService.getMyTodos(testUser.userId);
    console.log('Todos for user:', JSON.stringify(todos, null, 2));
  }
  
  await app.close();
}
bootstrap();
