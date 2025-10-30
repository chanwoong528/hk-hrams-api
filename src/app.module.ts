import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoalModule } from './goal/goal.module';
import { GoalAssessmentByModule } from './goal-assessment-by/goal-assessment-by.module';
import { AppraisalModule } from './appraisal/appraisal.module';
import { AppraisalByModule } from './appraisal-by/appraisal-by.module';
import { HramsUserModule } from './hrams-user/hrams-user.module';
import { DepartmentModule } from './department/department.module';
import { HramsUserDepartmentModule } from './hrams-user-department/hrams-user-department.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'env/dev.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT_POOL', 5432),
        username: configService.get<string>('POSTGRES_USER', 'postgres'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get<string>('POSTGRES_DB', 'hrams'),
        entities: [],
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        retryAttempts:
          configService.get<string>('NODE_ENV') === 'production' ? 10 : 1,
        extra: {
          options: '-c timezone=Asia/Seoul',
        },
        ssl:
          configService.get<string>('NODE_ENV') === 'production'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
    }),
    GoalModule,
    GoalAssessmentByModule,
    AppraisalModule,
    AppraisalByModule,
    HramsUserModule,
    DepartmentModule,
    HramsUserDepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
