import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";
import { createHmac, randomBytes } from "crypto";
import { sign } from "jsonwebtoken";
import config from "../../config";

const jwtOptions = config.JWT;

interface UserAttributes {
  id: number;
  username: string;
  password: string;
  salt: string;
}

class User extends Model<UserAttributes, UserInput> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public salt!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public generatePassword(password: string) {
    const salt = randomBytes(16).toString("base64");
    const hash = createHmac("sha512", salt).update(password);
    const value = hash.digest("base64");
    return {
      salt,
      passwordHash: value,
    };
  }

  public validatePassword(password: string) {
    const salt = this.getDataValue("salt");
    const hash = createHmac("sha512", salt).update(password);
    const value = hash.digest("base64");
    return value === this.password;
  }

  public generateJWT() {
    return sign(
      {
        id: this.id,
        username: this.username,
      },
      jwtOptions.secretOrKey,
      {
        expiresIn: "1d",
        issuer: jwtOptions.issuer,
      }
    );
  }

  public toJSON() {
    return {
      ...this.get(),
      password: undefined,
      salt: undefined,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: any) {
        const { salt, passwordHash } = this.generatePassword(value);
        this.setDataValue("password", passwordHash);
        this.setDataValue("salt", salt);
      },
    },
    salt: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    sequelize,
    defaultScope: {
      attributes: { exclude: ["password", "salt"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password", "salt"] },
      },
    },
  }
);

export interface UserInput extends Optional<UserAttributes, "id" | "salt"> {}

export interface UserOutput extends Required<UserAttributes> {}

export default User;
