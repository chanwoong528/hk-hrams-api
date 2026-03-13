import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGoalAssessmentByPayload {
  @ApiProperty({ description: '평가 대상 목표 ID', example: 'goal-123' })
  goalId: string;

  @ApiProperty({ description: '부여할 등급 또는 점수', example: 'A' })
  grade: string;

  @ApiProperty({ description: '평가자 ID', example: 'evaluator-456' })
  gradedBy: string;

  @ApiPropertyOptional({ description: '목표에 대한 코멘트 (선택)', example: '목표 달성도가 우수합니다.' })
  comment?: string;
}
