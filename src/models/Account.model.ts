import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db";

interface AccountAttributes {
  id: number;
  name: string;
  balance: number;
}

class Account
  extends Model<AccountAttributes, AccountInput>
  implements AccountAttributes
{
  public id!: number;
  public name!: string;
  public balance!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Account.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
  }
);

export interface AccountInput extends Optional<AccountAttributes, "id"> {}
export interface AccountOutput extends Required<AccountAttributes> {}

export default Account;
