import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHramsUserDepartmentPayload {
  @ApiProperty({ description: '사용자 ID', example: 'user-123' })
  userId: string;

  @ApiProperty({ description: '부서 ID', example: 'dept-456' })
  departmentId: string;

  @ApiPropertyOptional({ description: '부서장(리더) 여부', example: false })
  isLeader?: boolean;
}

export class UpdateHramsUserDepartmentByIdPayload {
  @ApiProperty({ description: '매핑(사용자-부서) ID', example: 'mapping-789' })
  hramsUserDepartmentId: string;

  @ApiPropertyOptional({ description: '부서장(리더) 여부 변경', example: true })
  isLeader?: boolean;

  @ApiPropertyOptional({ description: '사용자 ID 변경', example: 'user-123' })
  userId?: string;

  @ApiPropertyOptional({ description: '부서 ID 변경', example: 'dept-456' })
  departmentId?: string;
}

export class DeleteHramsUserDepartmentPayload {
  @ApiProperty({ description: '사용자 ID', example: 'user-123' })
  userId: string;

  @ApiProperty({ description: '부서 ID', example: 'dept-456' })
  departmentId: string;
}
