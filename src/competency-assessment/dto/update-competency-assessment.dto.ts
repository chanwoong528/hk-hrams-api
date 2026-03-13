import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompetencyAssessmentDto {
  @ApiPropertyOptional({ description: '수정할 평가 등급 (S, A, B, C, D 등)', example: 'A' })
  grade?: string;

  @ApiPropertyOptional({ description: '수정할 코멘트 내용', example: '뛰어난 문제 해결 능력을 보여주셨습니다.' })
  comment?: string;
}
