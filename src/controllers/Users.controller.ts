import User from "../models/User.model";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await User.findAll();
  return res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  return res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.create({
    username,
    password,
  });
  return res.json({
    id: user.id,
    username: user.username,
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username } = req.body;
  await User.update({ username }, { where: { id } });
  const user = await User.findByPk(id);
  return res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return res.status(202).json(user);
  }
  return res.status(404).json({ message: "User not found" });
};
