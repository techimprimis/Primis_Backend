import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { IUser, USERS_COLLECTION } from '../models/user.model';

export const getAllUsers = async (): Promise<IUser[]> => {
  const db = getDB();
  return db.collection<IUser>(USERS_COLLECTION).find().toArray();
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  const db = getDB();
  return db.collection<IUser>(USERS_COLLECTION).findOne({ _id: new ObjectId(id) });
};

export const createUser = async (userData: { name: string; email: string; password: string }): Promise<IUser> => {
  const db = getDB();

  const newUser: IUser = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection<IUser>(USERS_COLLECTION).insertOne(newUser);
  return { _id: result.insertedId, ...newUser };
};
