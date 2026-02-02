// import { getPool } from '../config/database';
// import { IUser, USERS_TABLE } from '../models/user.model';
// import { Pool, QueryResult } from 'pg';

// export const getAllUsers = async (): Promise<IUser[]> => {
//   const pool = getPool() as Pool;
//   const result: QueryResult<IUser> = await pool.query(`SELECT * FROM ${USERS_TABLE}`);
//   return result.rows;
// };

// export const getUserById = async (id: number): Promise<IUser | null> => {
//   const pool = getPool() as Pool;
//   const result: QueryResult<IUser> = await pool.query(`SELECT * FROM ${USERS_TABLE} WHERE id = $1`, [id]);
//   return result.rows[0] ?? null;
// };

// export const createUser = async (userData: { name: string; email: string; password: string }): Promise<IUser> => {
//   const pool = getPool() as Pool;
//   const now = new Date();
//   const result: QueryResult<IUser> = await pool.query(
//     `INSERT INTO ${USERS_TABLE} (name, email, password, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//     [userData.name, userData.email, userData.password, now, now]
//   );
//   if (!result.rows[0]) {
//     throw new Error('Failed to create user');
//   }
//   return result.rows[0];
// };
