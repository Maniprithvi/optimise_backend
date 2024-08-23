export interface IUser {
  name: string;
  email: string;
  picture: string;
  password: string;
  account: IAccount[];
}

export interface IAccount {
  _id: any;
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
  id_token: string;
  type: string;
}
export type User = {
  id: string;
  name: string;
  email: any;
};
export interface RequestCustom extends Request {
  header(arg0: string): unknown;
  user?: User;
}
