import { Strategy as JWTStrategy } from "passport-jwt";
import User from "../models/User.model";
import passport from "passport";
import { Request, Response } from "express";
import config from "../../config";

const jwtOptions = config.JWT;

const jwtStrategy = new JWTStrategy(jwtOptions, async (payload, done) => {
  const user = await User.findByPk(payload.id);
  if (user) {
    return done(null, user);
  }
  return done(null, false);
});

passport.use(jwtStrategy);

export const getJWT = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const user = await User.scope("withPassword").findOne({
    where: { username },
  });
  if (user && user.validatePassword(password)) {
    return res.json({
      token: user.generateJWT(),
    });
  }
  return res.status(401).json({ message: "Invalid username or password" });
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const user = await User.create({ username, password });
    return res.json({
      token: user.generateJWT(),
    });
  } catch (err: any) {
    // If the username is already taken
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Username already taken" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
