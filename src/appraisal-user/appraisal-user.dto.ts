import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppraisalUserPayload {
  @ApiProperty({ description: '평가 ID', example: 'appraisal-123' })
  appraisalId: string;

  @ApiPropertyOptional({ description: '평가 대상에서 제외할 사용자 ID 목록', type: [String], example: ['user-456'] })
  exceptionUserList?: string[]; // users that are not part of the appraisal and not being assessed
}
