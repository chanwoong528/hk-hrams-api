import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppraisalPayload {
  @ApiProperty({ description: '평가 제목', example: '2024년 상반기 인사상반기 (개발본부)' })
  title: string;

  @ApiProperty({ description: '평가 종류 (예: 역량평가, 다면평가 등)', example: 'COMPETENCY' })
  appraisalType: string;

  @ApiProperty({ description: '평가 설명 내용', example: '2024년도 상반기 직무 역량 평가입니다.' })
  description: string;

  @ApiProperty({ description: '평가 종료 일시', example: '2024-06-30T23:59:59Z' })
  endDate: Date;

  @ApiPropertyOptional({ description: '피평가자 최소 직급', example: 1 })
  minGradeRank?: number;

  @ApiPropertyOptional({ description: '피평가자 최대 직급', example: 5 })
  maxGradeRank?: number;
  // exceptionUserList?: string[]; // users that are not part of the appraisal and not being assessed
}

export class UpdateAppraisalPayload {
  @ApiPropertyOptional({ description: '수정할 평가 제목', example: '2024년 하반기 인사상반기' })
  title?: string;

  @ApiPropertyOptional({ description: '수정할 평가 종류', example: 'LEADERSHIP' })
  appraisalType?: string;

  @ApiPropertyOptional({ description: '수정할 평가 설명 내용', example: '설명 수정...' })
  description?: string;

  @ApiPropertyOptional({ description: '수정할 평가 종료 일시', example: '2024-12-31T23:59:59Z' })
  endDate?: Date;

  @ApiPropertyOptional({ description: '평가 상태 (진행중, 완료 등)', example: 'IN_PROGRESS' })
  status?: string;

  @ApiPropertyOptional({ description: '피평가자 최소 직급', example: 2 })
  minGradeRank?: number;

  @ApiPropertyOptional({ description: '피평가자 최대 직급', example: 4 })
  maxGradeRank?: number;
}
