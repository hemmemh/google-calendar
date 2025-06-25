import { UserSchema } from "src/schemas/User.schema";

export interface AccessToken {
  access_token: string;
  user: UserSchema;
}
