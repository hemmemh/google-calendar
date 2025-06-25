import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDTO } from './dtos/create-event.dto';
import { UpdateEventDTO } from './dtos/update-event.dto';
import { GetEventsByParamsDTO } from './dtos/get-events-by-params.dto';
import { EventChangeObj } from './interfaces/event-change';

@Controller('events')
export class EventsController {



    constructor(private eventsService:EventsService) {}


    @Get('/getEventsByParams')
    getEventsByParams(
      @Query() query: GetEventsByParamsDTO,
    ) {
      return this.eventsService.getEventsByParams(query)
    }


    @Post('/create')
    create(@Body() dto:CreateEventDTO) {
      return this.eventsService.create(dto);
    }

    @Post('/update')
    update(@Body() dto:UpdateEventDTO) {
      return this.eventsService.update(dto);
    }

    @Delete('/delete/:uid')
    delete(@Param('uid') uid:string, @Query() query: {all:string}) {
      return this.eventsService.delete(uid, {all: query.all === 'true'})
    }

    @Post('/change')
    chooseChangeMethod(
  
      @Body() dto: EventChangeObj,
    ) {
      return this.eventsService.chooseChangeMethod(dto);
    }

}
