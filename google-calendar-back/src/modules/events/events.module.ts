import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSchema } from 'src/schemas/event.schema';

@Module({
  providers: [EventsService],
  controllers: [EventsController],
  imports: [TypeOrmModule.forFeature([EventSchema])],
})
export class EventsModule {}
