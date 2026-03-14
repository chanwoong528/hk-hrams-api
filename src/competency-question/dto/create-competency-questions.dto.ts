import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCompetencyQuestionsDto {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  @IsString()
  appraisalId: string;

  @ApiProperty({ description: '질문을 할당할 부서 ID', example: 'dept-456' })
  @IsString()
  departmentId: string;

  @ApiProperty({ description: '직군 (개발, 디자인 등)', example: '개발' })
  @IsString()
  @IsOptional()
  jobGroup?: string;

  @ApiProperty({ description: '평가 질문 내용 목록', type: [String], example: ['의사소통 능력이 뛰어난가요?', '문제 해결 능력이 우수한가요?'] })
  @IsArray()
  @IsString({ each: true })
  questions: string[];
}
