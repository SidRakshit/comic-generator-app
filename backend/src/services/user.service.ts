import { User, UserModel } from "../models/user.model";

export class UserService {
	static async getAllUsers(): Promise<User[]> {
		return UserModel.findAll();
	}

	static async getUserById(id: number): Promise<User | null> {
		return UserModel.findById(id);
	}
}
