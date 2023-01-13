import Account from "../models/Account.model";
import { Request, Response } from "express";

export const getAccounts = async (req: Request, res: Response) => {
  const accounts = await Account.findAll();
  return res.json(accounts);
};

export const getAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await Account.findByPk(id);
  if (account) {
    return res.json(account);
  }
  return res.status(404).json({ message: "Account not found" });
};

export const createAccount = async (req: Request, res: Response) => {
  let { name, balance } = req.body;
  if (!balance) {
    balance = 0;
  }
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const account = await Account.create({ name, balance });
  return res.json(account);
};

export const updateAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, balance } = req.body;
  const account = await Account.findByPk(id);
  if (account) {
    account.name = name;
    account.balance = balance;
    await account.save();
    return res.json(account);
  }
  return res.status(404).json({ message: "Account not found" });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.params;
  const account = await Account.findByPk(id);
  if (account) {
    await account.destroy();
    return res.json({ message: "Account deleted" });
  }
  return res.status(404).json({ message: "Account not found" });
};
