import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoalModule } from './goal/goal.module';
import { GoalAssessmentByModule } from './goal-assessment-by/goal-assessment-by.module';
import { PerformanceAppraisalModule } from './performance-appraisal/performance-appraisal.module';
import { PerformanceAppraisalByModule } from './performance-appraisal-by/performance-appraisal-by.module';
import { HramsUserModule } from './hrams-user/hrams-user.module';

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
    PerformanceAppraisalModule,
    PerformanceAppraisalByModule,
    HramsUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
