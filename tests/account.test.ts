import {
  beforeAll,
  afterAll,
  describe,
  test,
  expect,
  jest,
} from "@jest/globals";
import Account from "../src/models/Account.model";
import User from "../src/models/User.model";
import server from "../src/server";

let testServer: any;
let testPort: number;

describe("Account API Tests", () => {
  beforeAll(async () => {
    // Generate a random port for the test server
    testPort = Math.floor(Math.random() * 10000) + 10000;
    testServer = server.listen(testPort);
  });

  afterAll(() => {
    testServer.close();
  });

  describe("Authenticated", () => {
    let token: string;
    beforeAll(async () => {
      // Create a user
      await User.sync({ force: true });
      const user = await User.create({
        username: "testUser",
        password: "testPassword",
      });
      // Get the token
      token = user.generateJWT();
      expect(token).toBeDefined();

      // Create some accounts
      await Account.sync({ force: true });
      await Account.bulkCreate([
        { name: "account1", balance: 100 },
        { name: "account2", balance: 200 },
        { name: "account3", balance: 300 },
      ]);
    });
    test("GET /accounts", async () => {
      const controlCaseAccounts = await Account.findAll();
      const accountLength = controlCaseAccounts.length;
      const req = await fetch(`http://localhost:${testPort}/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accounts = await req.json();
      expect(accounts.length).toBe(accountLength);
      // Expect that the account's balance is not returned
      expect(accounts[0].balance).toEqual(100);
    });
    test("GET /accounts/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/accounts/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const account = await req.json();
      expect(account.name).toEqual("account1");
    });
    test("POST /accounts", async () => {
      const req = await fetch(`http://localhost:${testPort}/accounts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "account4", balance: 400 }),
      });
      const account = await req.json();
      expect(account.name).toEqual("account4");
      expect(account.balance).toEqual(400);

      // Delete the account
      await Account.destroy({ where: { name: "account4" } });
    });
    test("PUT /accounts/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/accounts/1`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "account1", balance: 500 }),
      });
      const account = await req.json();
      expect(account.name).toEqual("account1");
      expect(account.balance).toEqual(500);
    });
    test("DELETE /accounts/:id", async () => {
      // Create an account
      const testAccount = await Account.create({
        name: "account5",
        balance: 500,
      });
      const req = await fetch(
        `http://localhost:${testPort}/accounts/${testAccount.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await req.json();
      expect(response.message).toEqual("Account deleted");

      const controlAccounts = await Account.findAll();

      // Expect that the account was deleted
      expect(controlAccounts).not.toContain(testAccount);
    });
  });
  describe("Unauthenticated", () => {});
});
