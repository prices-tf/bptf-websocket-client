import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/config/configuration';
import { validation } from './common/config/validation';
import { HealthModule } from './health/health.module';
import { EventModule } from './event/event.module';
import { RabbitMQWrapperModule } from './rabbitmq-wrapper/rabbitmq-wrapper.module';
import { WebsocketModule } from './websocket/websocket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: process.env.NODE_ENV === 'test' ? '.test.env' : '.env',
      load: [configuration],
      validationSchema: validation,
    }),
    EventEmitterModule.forRoot(),
    WebsocketModule,
    EventModule,
    HealthModule,
    RabbitMQWrapperModule,
  ],
})
export class AppModule {}
