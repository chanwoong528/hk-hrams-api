import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentPayload {
  @ApiProperty({ description: '부서명', example: '개발팀' })
  departmentName: string;

  @ApiPropertyOptional({ description: '상위 부서 ID (최상위 부서인 경우 생략)', example: 'parent-dept-123' })
  parentId?: string;

  @ApiPropertyOptional({ description: '부서장(리더)의 사용자 ID', example: 'user-456' })
  leaderId?: string;

  @ApiPropertyOptional({ description: '부서 표시 순서', example: 1 })
  rank?: number;
}

export class UpdateDepartmentPayload {
  @ApiPropertyOptional({ description: '변경할 부서명', example: '백엔드 개발팀' })
  departmentName?: string;

  @ApiPropertyOptional({ description: '변경할 상위 부서 ID', example: 'new-parent-dept' })
  parentId?: string;

  @ApiPropertyOptional({ description: '변경할 부서장의 사용자 ID', example: 'user-789' })
  leaderId?: string;

  @ApiPropertyOptional({ description: '변경할 부서 표시 순서', example: 2 })
  rank?: number;
}

export class UpdateManyDepartmentsPayload {
  @ApiProperty({ description: '부서 ID' })
  departmentId: string;

  @ApiProperty({ description: '새로운 상위 부서 ID' })
  parentId: string;
}

// Response DTOs for nested structure
export class DepartmentTreeLeader {
  @ApiProperty({ description: '리더 사용자 ID' })
  userId: string;
  @ApiProperty({ description: '리더 이름' })
  koreanName: string;
  @ApiProperty({ description: '리더 이메일' })
  email: string;
}

export class DepartmentTreeResponse {
  @ApiProperty({ description: '부서 ID' })
  departmentId: string;

  @ApiProperty({ description: '부서명' })
  departmentName: string;

  @ApiProperty({ description: '부서 표시 순서' })
  rank: number;

  @ApiPropertyOptional({ description: '상위 부서 ID' })
  parentId?: string;

  @ApiPropertyOptional({ description: '리더 사용자 ID' })
  leaderId?: string;

  @ApiPropertyOptional({ description: '리더 정보', type: DepartmentTreeLeader })
  leader?: DepartmentTreeLeader;

  @ApiPropertyOptional({ description: '하위 부서 목록', type: [DepartmentTreeResponse] })
  childrenDepartments?: DepartmentTreeResponse[];

  @ApiProperty({ description: '생성 일시' })
  created: Date;

  @ApiProperty({ description: '수정 일시' })
  updated: Date;
}

// DTO for moving department to different parent
export class MoveDepartmentPayload {
  @ApiPropertyOptional({ description: '새로운 상위 부서 ID' })
  newParentId?: string;
}
