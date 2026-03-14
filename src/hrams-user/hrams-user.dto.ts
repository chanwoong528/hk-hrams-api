import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HramsUser } from './hrams-user.entity';
import { Department } from 'src/department/department.entity';

export class CreateHramsUserPayload {
  @ApiProperty({ description: '사용자 이름 (한글)', example: '홍길동' })
  koreanName: string;

  @ApiProperty({ description: '사용자 이메일', example: 'hong@hankookilbo.com' })
  email: string;

  @ApiPropertyOptional({ description: '소속 부서 ID 목록', type: [String], example: ['dept-123', 'dept-456'] })
  departments?: string[];

  @ApiPropertyOptional({ description: '초기 비밀번호 (미입력시 기본값 자동 생성)', example: 'password123!' })
  pw?: string;

  @ApiPropertyOptional({ description: '직군 (개발, 디자인 등)', example: 'development' })
  jobGroup?: string;
}

export class HramsUserWithDepartments extends HramsUser {
  @ApiProperty({ description: '사용자 소속 부서 목록', type: [Department] })
  departments: Department[];
}

export class CreateBulkHramsUserPayload {
  @ApiProperty({ description: '생성할 사용자 목록', type: [CreateHramsUserPayload] })
  users: CreateHramsUserPayload[];
}

export class UpdateHramsUserPayload {
  @ApiPropertyOptional({ description: '변경할 사용자 이름 (한글)', example: '홍길동' })
  koreanName?: string;

  @ApiPropertyOptional({ description: '변경할 사용자 이메일', example: 'hong@hankookilbo.com' })
  email?: string;

  @ApiPropertyOptional({ description: '제거할 부서 ID 목록', type: [String], example: ['dept-123'] })
  tobeDeletedDepartments?: string[];

  @ApiPropertyOptional({ description: '추가할 부서 ID 목록', type: [String], example: ['dept-789'] })
  tobeAddedDepartments?: string[];

  @ApiPropertyOptional({ description: '사용자 상태 (예: 재직, 퇴사 등)', example: 'ACTIVE' })
  userStatus?: string;

  @ApiPropertyOptional({ description: '사용자 직급/레벨', example: 'G2' })
  lv?: string;

  @ApiPropertyOptional({ description: '직군 (개발, 디자인 등)', example: 'development' })
  jobGroup?: string;
}
