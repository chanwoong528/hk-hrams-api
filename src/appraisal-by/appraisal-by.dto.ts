import { ApiProperty } from '@nestjs/swagger';

export class CreateAppraisalByPayload {
  @ApiProperty({ description: '평가 ID (어떤 평가인지)', example: 'appraisal-123' })
  appraisalId: string;

  @ApiProperty({ description: '평가 종류 (예: 본인평가, 1차평가 등)', example: 'SELF' })
  assessType: string;

  @ApiProperty({ description: '평가 기간 (상반기, 하반기 등)', example: 'FIRST_HALF' })
  assessTerm: string;

  @ApiProperty({ description: '부여한 등급 (S, A, B, C, D 등 혹은 점수)', example: 'A' })
  grade: string;

  @ApiProperty({ description: '평가 코멘트 / 종합 의견', example: '올 한 해 수고 많으셨습니다.' })
  comment: string;

  @ApiProperty({ description: '평가자 ID (누가 평가했는지)', example: 'evaluator-user-456' })
  assessedById: string; // whos grading
}
