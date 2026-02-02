import { Router } from 'express';

// interface ICreateUserBody {
//     name: string;
//     email: string;
//     password: string;
// }

const userRoutes = Router();

// const getUsers: RequestHandler = (_req, res) => {
//     void (async (): Promise<void> => {
//         try {
//             const users = await userService.getAllUsers();
//             res.json(users);
//         } catch (error) {
//             res.status(500).json({ error: 'Server error' });
//         }
//     })();
// };

// const getUserById: RequestHandler = (req, res) => {
//     void (async (): Promise<void> => {
//         try {
//             const { id } = req.params;
//             if (typeof id !== 'string' || id === '') {
//                 res.status(400).json({ error: 'User ID is required' });
//                 return;
//             }
//             const userId = parseInt(id, 10);
//             if (isNaN(userId)) {
//                 res.status(400).json({ error: 'Invalid user ID' });
//                 return;
//             }
//             const user = await userService.getUserById(userId);

//             if (!user) {
//                 res.status(404).json({ error: 'User not found' });
//                 return;
//             }

//             res.json(user);
//         } catch (error) {
//             res.status(500).json({ error: 'Server error' });
//         }
//     })();
// };

// const createUser: RequestHandler<object, object, ICreateUserBody> = (req, res) => {
//     void (async (): Promise<void> => {
//         try {
//             const { name, email, password } = req.body;
//             const user = await userService.createUser({ name, email, password });
//             res.status(201).json(user);
//         } catch (error) {
//             res.status(500).json({ error: 'Server error' });
//         }
//     })();
// };

// userRoutes.get('/', getUsers);
// userRoutes.get('/:id', getUserById);
// userRoutes.post('/', createUser);

export default userRoutes;
