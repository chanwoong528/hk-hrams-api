import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoalDto {
  @ApiProperty({ description: '목표 제목', example: '2024년 시스템 리팩토링' })
  title: string;

  @ApiProperty({ description: '목표 설명', example: '모놀리식 환경을 MSA로 전환하기 위한 기초 작업을 수행한다.' })
  description: string;

  @ApiPropertyOptional({ description: '목표 유형 (예: 공통, 개인 등)', example: 'COMMON' })
  goalType?: string;
}

export class CreateGoalPayload {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '생성할 목표 목록', type: [GoalDto] })
  goals: GoalDto[];
}

export class CreateCommonGoalPayload {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '부서 ID', example: 'dept-456' })
  departmentId: string;

  @ApiProperty({ description: '생성할 공통 목표 목록', type: [GoalDto] })
  goals: GoalDto[];
}

export class UpdateCommonGoalPayload {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '부서 ID', example: 'dept-456' })
  departmentId: string;

  @ApiProperty({ description: '기존 목표 제목', example: '시스템 개편' })
  oldTitle: string;

  @ApiProperty({ description: '새로운 목표 제목', example: '신규 시스템 구축' })
  newTitle: string;

  @ApiProperty({ description: '새로운 목표 설명', example: '신규 시스템을...' })
  newDescription: string;
}

export class DeleteCommonGoalPayload {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '부서 ID', example: 'dept-456' })
  departmentId: string;

  @ApiProperty({ description: '삭제할 목표 제목', example: '기존 시스템 유지보수' })
  title: string;
}
