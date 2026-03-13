import { ApiProperty } from '@nestjs/swagger';

export class CreateCompetencyQuestionsDto {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '질문을 할당할 부서 ID', example: 'dept-456' })
  departmentId: string;

  @ApiProperty({ description: '평가 질문 내용 목록', type: [String], example: ['의사소통 능력이 뛰어난가요?', '문제 해결 능력이 우수한가요?'] })
  questions: string[];
}
