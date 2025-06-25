
import { DateTime } from "luxon";
import { EventModel } from "../../../models/event.model"



export const hoursAndMinutesByReportDate = (report:EventModel)=>{

    const endDate = DateTime.fromMillis(report.endDate).toFormat("HH:mm");
    return `${DateTime.fromMillis(report.startDate).toFormat("HH:mm")} - 
        ${endDate === "00:00" ? "24:00" : endDate}`;
}

export const changeEventDate = (date:number, pos:number,day:DateTime) => {
    return DateTime.fromMillis(day.valueOf()) // Convert 'day' to DateTime object
    .startOf('day') // Start of the day
    .set({ hour: Math.floor(pos / 60), minute: pos % 60 }) // Set hours and minutes
    .toMillis(); // Get the millisecond timestamp
  }

export const startDateInMinutes = (date:string, distanceY:number)=>{
    DateTime.fromISO(date).plus({minutes:distanceY})
    const hoursToMinutes = Math.floor(DateTime.fromISO(date).hour * 60);
    const minutes = DateTime.fromISO(date).minute;
    return hoursToMinutes + minutes + distanceY;
}

export const addReportsDateInMinutesToDay = (day:DateTime, distanceY:number) => {
     console.log('fff', day, distanceY);
     
    return DateTime.fromMillis(day.valueOf())  // Convert 'day' to DateTime object
    .startOf('day') // Set to the start of the day (midnight)
    .set({
        minute: distanceY
    })
    .toMillis();
}

