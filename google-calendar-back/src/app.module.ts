import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSchema } from './schemas/event.schema';
import { UserSchema } from './schemas/User.schema';
import { EventsModule } from './modules/events/events.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './modules/auth/guards/JwtGuard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.ENV === 'production' ? '.prod.env' : '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRESQL_HOST,
      port: +process.env.POSTGRESQL_PORT,
      username: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASS,
      database: process.env.POSTGRESQL_DB,
      entities: [
        EventSchema,
        UserSchema
      ],
    
      synchronize: true,
    }),
    EventsModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtGuard }],
})
export class AppModule {}
