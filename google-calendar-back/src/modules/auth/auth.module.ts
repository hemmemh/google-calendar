import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategies';
import { PassportModule } from '@nestjs/passport';
import { secret } from './lib/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';

@Module({
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    UserModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: secret,
      signOptions: { expiresIn: '20m' },
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
