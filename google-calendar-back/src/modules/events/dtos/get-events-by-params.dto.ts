import { UserSchema } from "src/schemas/User.schema";

export class GetEventsByParamsDTO {
    startDate: string;
    endDate:  string;
    userUid:string
}