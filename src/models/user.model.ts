
export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export const USERS_TABLE = 'users';
