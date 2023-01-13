import crypto from "crypto";

export type HashedPassword = {
  salt: string;
  passwordHash: string;
};

export const generatePassword = (password: string): HashedPassword => {
  const salt = crypto.randomBytes(16).toString("base64");
  const hash = crypto.createHmac("sha512", salt).update(password);
  const value = hash.digest("base64");
  return {
    salt,
    passwordHash: value,
  };
};

/**
 * Checks if the password is valid
 * @param password The Password to validate
 * @param salt The salt used to hash the password
 * @param passwordHash The hashed password
 * @returns {boolean} True if the password is valid, false otherwise
 */
export const validatePassword = (
  password: string,
  salt: string,
  passwordHash: string
): boolean => {
  const hash = crypto.createHmac("sha512", salt).update(password);
  const value = hash.digest("base64");
  return value === passwordHash;
};
