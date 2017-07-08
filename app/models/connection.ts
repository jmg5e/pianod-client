import {LoginInfo} from './loginInfo';

export interface Connection {
  port: number;
  host: string;
  isDefault?: boolean;
  defaultUser?: LoginInfo;
}
