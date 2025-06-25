import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventDTO } from './dtos/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventSchema } from 'src/schemas/event.schema';
import { Repository } from 'typeorm';
import { UpdateEventDTO } from './dtos/update-event.dto';
import { GetEventsByParamsDTO } from './dtos/get-events-by-params.dto';
import { EventChange, EventChangeObj } from './interfaces/event-change';
import { checkIsFullDay } from 'src/utils/events.utils';
import { RRule, RRuleSet, rrulestr } from 'rrule';
import {DateTime} from 'luxon'
import {v4} from 'uuid'
import { log } from 'console';
import { retry } from 'rxjs';

@Injectable()
export class EventsService {

    constructor(
        @InjectRepository(EventSchema)
        private eventSchema: Repository<EventSchema>,

      ) {}


      async getEventsByParams(query: GetEventsByParamsDTO) {
        console.log('qeeee');
        
          return this.eventSchema
          .createQueryBuilder('event')
          .leftJoinAndSelect('event.user', 'user')
          .where(
            '( (event.startDate >= :startDate AND event.startDate <= :endDate) ' +
            'OR (event.endDate >= :startDate AND event.endDate <= :endDate)' + 
           'OR (event.endDate >= :endDate AND event.startDate <= :startDate) ) ' + 
           'AND user.uid = :userUid', 
            { startDate: +query.startDate, endDate: +query.endDate, userUid: query.userUid }
          )
          .orderBy('event.startDate', 'ASC')
          .getMany();
      }
    
      private async getEventsByRruleUid(rruleUid:string){
                 return this.eventSchema
                 .createQueryBuilder('event')
                 .leftJoinAndSelect('event.user', 'user')
                 .where('event.rruleUid = :rruleUid', {rruleUid})
                 .orderBy('event.startDate', 'ASC')
                 .getMany();
      }



    async create(dto:CreateEventDTO):Promise<EventChange[]>{  
        let eventChanges:EventChange[] = []

        if(dto.rrule){
         eventChanges =  await this.createByRRule(dto)
       
        }else{
          eventChanges = await this.createOne(dto)
        }  

        return eventChanges
  
    }


    private async  createByRRule(dto:CreateEventDTO){
      const dates = this.getRRuleDates(dto)
      const eventChanges:EventChange[] = []
      const isFullDay = checkIsFullDay(dto.startDate, dto.endDate)
      const diff = dto.endDate - dto.startDate
      const rruleUid = v4()
     for(const date of dates){
  

      const start = DateTime.fromJSDate(date).set({
        hour:DateTime.fromMillis(dto.startDate).hour,
        minute:DateTime.fromMillis(dto.startDate).minute
      })

      const end = start.plus({'millisecond': diff})
      const startDate =start.toMillis()
      const endDate = end.toMillis()
      const response =  await this.eventSchema.save({...dto, isFullDay,startDate, endDate, rruleUid})

      const event = await this.eventSchema
      .findOne({where:{uid:response.uid}, relations:{user:true}})

      eventChanges.push(
        {
          undo:{method:'create',obj:event},
          redo:{method:'delete',obj:event}
        }
      )

     }

     return eventChanges
    }

    private async createOne(dto:CreateEventDTO){
      const isFullDay = checkIsFullDay(dto.startDate, dto.endDate)
      const response =  await this.eventSchema.save({...dto, isFullDay})
      const eventChanges:EventChange[] = []
      const event = await this.eventSchema
      .findOne({where:{uid:response.uid}, relations:{user:true}})

      eventChanges.push(
          {
            undo:{method:'create',obj:event},
            redo:{method:'delete',obj:event}
          }
        )

        return eventChanges
    }

    private getRRuleDates(dto:CreateEventDTO | UpdateEventDTO){

      const set = new RRuleSet();
        const rule: RRuleSet | RRule = rrulestr(dto.rrule, { dtstart:new Date(dto.startDate) });
        console.log('rule', rule, dto);
        
        set.rrule(rule);
       return set.all()
    }



    async update(dto:UpdateEventDTO):Promise<EventChange[]>{
      let eventChanges:EventChange[] = []

      
      if(dto.all && dto.rruleUid){
        eventChanges = await this.updateAll(dto)

      }else if (dto.rrule && !dto.rruleUid){
         eventChanges =await  this.firstRruleUpdate(dto)
     
      }else {
       eventChanges = await this.oneEventUpdate(dto)
      }

    return  eventChanges
  
    }


    private async updateAll(dto:UpdateEventDTO){
      let eventChanges:EventChange[] = []
      const events = await this.getEventsByRruleUid(dto.rruleUid)
      for(const deletedEvent of events){
        eventChanges = await this.delete(deletedEvent.uid, {all:false})
       }
       const createDTO:CreateEventDTO = {
         title:dto.title,
         description:dto.description,
         startDate:dto.rrule ? dto.startDate : events[0].startDate,
         endDate:dto.rrule ? dto.endDate : events[0].endDate,
         user:events[0].user,
         rrule:dto.rrule
       }
     eventChanges = [...eventChanges, ...await this.create(createDTO)]

     return eventChanges
    }

    private async firstRruleUpdate(dto:UpdateEventDTO){
      const dates = this.getRRuleDates(dto)
      const diff = dto.endDate - dto.startDate
      const isFullDay = checkIsFullDay(dto.startDate, dto.endDate)
      let eventChanges:EventChange[] = []
      const rruleUid = v4()
      console.log('act', dates);
      const response = await this.eventSchema.save({...dto, isFullDay, rruleUid})
      const event = await this.eventSchema
      .findOne({where:{uid:response.uid}, relations:{user:true}})

      eventChanges.push(
        {
          undo:{method:'update',obj:event},
          redo:{method:'update',obj:event}
        }
      )
      dates.shift()
      delete dto.uid
     for(const date of dates){
  

      const start = DateTime.fromJSDate(date).set({
        hour:DateTime.fromMillis(dto.startDate).hour,
        minute:DateTime.fromMillis(dto.startDate).minute
      })

      const end = start.plus({'millisecond': diff})
      const startDate =start.toMillis()
      const endDate = end.toMillis()
      const response =  await this.eventSchema.save({...dto, isFullDay,startDate, endDate, rruleUid})

      const event = await this.eventSchema
      .findOne({where:{uid:response.uid}, relations:{user:true}})

      eventChanges.push(
        {
          undo:{method:'create',obj:event},
          redo:{method:'delete',obj:event}
        }
      )

     }
     return eventChanges
    }


    private async  oneEventUpdate(dto:UpdateEventDTO){
      const finded = await this.getByID(dto.uid)
      const isFullDay = checkIsFullDay(dto.startDate, dto.endDate)
      let eventChanges:EventChange[] = []
      if(!finded) throw new HttpException('Не удалось найти элемент', HttpStatus.NOT_FOUND)
      
      const { uid,  ...updatedDto } = dto;
  
      await this.eventSchema.save({...finded, ...updatedDto, isFullDay})
  
      const updated = await this.getByID(dto.uid)
  
      eventChanges.push(
          {
            undo:{method:'update',obj:finded},
            redo:{method:'update',obj:updated}
          }
        )

        return eventChanges
    }


    async delete(uid:string, query: {all:boolean}):Promise<EventChange[]>{
      const finded = await this.getByID(uid)
      let eventChanges:EventChange[] = []

         if(query.all && finded.rruleUid){
             eventChanges = await this.deleteAll(finded)
         }else{
          eventChanges = await this.deleteOne(finded, uid)
         }
      


    return  eventChanges
    } 


    private async  deleteAll(finded: EventSchema){
      const eventChanges:EventChange[] = []
      const events = await this.getEventsByRruleUid(finded.rruleUid)
      for(const event of events){
        await this.eventSchema.delete({uid:event.uid})
        eventChanges.push(
          {
            undo:{method:'delete',obj:finded},
            redo:{method:'create',obj:finded}
          }
        )
      }

      return eventChanges
    }

    private async deleteOne(finded: EventSchema, uid:string){
      await this.eventSchema.delete({uid})
      const eventChanges:EventChange[] = []
    
      eventChanges.push(
          {
            undo:{method:'delete',obj:finded},
            redo:{method:'create',obj:finded}
          }
        )

        return eventChanges
    }

    async getByID(uid:string){
        const response =  await this.eventSchema.findOne({
            where:{uid},
            relations:{user:true}
        })
        return response
    }


    async chooseChangeMethod(changeEvent:EventChangeObj){

  
        const reportMethods = {
          update:()=> this.eventSchema.save(changeEvent.obj),
          create:()=> this.eventSchema.delete(changeEvent.obj.uid),
          delete:()=> this.eventSchema.save(changeEvent.obj)
        }
    
      
    
        await reportMethods[changeEvent.method]()
       }



}
