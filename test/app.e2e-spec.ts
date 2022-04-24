import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // Didn't have to do this before when using @golevelup/nestjs-rabbitmq@1.17.1
    const amqpConnection = app.get(AmqpConnection);
    await amqpConnection.managedConnection.close();
    return app.close();
  });

  it('should be defined', () => {
    return expect(app).toBeDefined();
  });
});
