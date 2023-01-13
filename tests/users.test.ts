import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  jest,
  beforeEach,
} from "@jest/globals";
import User from "../src/models/User.model";
import server from "../src/server";

let testServer: any;
let testPort: number;

describe("Users API", () => {
  beforeAll(async () => {
    // Generate a random port for the test server
    testPort = Math.floor(Math.random() * 10000) + 10000;
    testServer = server.listen(testPort);

    await User.sync({ force: true });
    await User.bulkCreate([
      { username: "user1", password: "user1Password" },
      { username: "user2", password: "user2Password" },
      { username: "user3", password: "user3Password" },
    ]);
  });

  afterAll(() => {
    testServer.close();
  });

  describe("Authenticated", () => {
    let token: string;
    beforeAll(async () => {
      // Create a test user
      const user = await User.create({
        username: "jwtUser",
        password: "testPassword",
      });

      // Get the token
      token = user.generateJWT();
      expect(token).toBeDefined();
    });

    afterAll(async () => {
      await User.destroy({ where: { username: "jwtUser" } });
    });

    test("GET /users", async () => {
      const controlCaseUsers = await User.findAll();
      const userLength = controlCaseUsers.length;
      const req = await fetch(`http://localhost:${testPort}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = await req.json();
      expect(users.length).toBe(userLength);
      // Expect that the user's password is not returned
      users.forEach((user: any) => {
        expect(user.password).toBeUndefined();
      });
    });

    test("GET /users/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/users/1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await req.json();
      expect(user.username).toBe("user1");
      // Expect that the user's password is not returned
      expect(user.password).toBeUndefined();
    });

    test("POST /users", async () => {
      const req = await fetch(`http://localhost:${testPort}/users`, {
        method: "POST",
        body: JSON.stringify({
          username: "user4",
          password: "testPassword",
          token: token,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const user = await req.json();
      expect(user.username).toBe("user4");
      // Expect that the user's password is not returned
      expect(user.password).toBeUndefined();

      // Expect the user to be created in the database
      const dbUser = await User.findOne({ where: { username: "user4" } });
      expect(dbUser).toBeDefined();
    });

    test("PUT /users/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/users/1`, {
        method: "PUT",
        body: JSON.stringify({ username: "user1-updated", token: token }),
        headers: { "Content-Type": "application/json" },
      });
      const user = await req.json();
      expect(req.status).toBe(200);
      expect(user.username).toBe("user1-updated");
      await User.update(
        { username: "user1" },
        { where: { username: "user1-updated" } }
      );
    });

    test("DELETE /users/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/users/1`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await req.json();
      expect(req.status).toBe(202);
      expect(user.username).toBe("user1");
      await User.create({ username: "user1", password: "user1Password" });
    });
  });

  describe("Unauthenticated", () => {
    test("GET /users", async () => {
      const req = await fetch(`http://localhost:${testPort}/users`);
      expect(req.status).toBe(401);
    });

    test("GET /users/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/users/1`);
      expect(req.status).toBe(401);
    });

    test("POST /users", async () => {
      const req = await fetch(`http://localhost:${testPort}/users`, {
        method: "POST",
        body: JSON.stringify({ username: "user4", password: "testPassword" }),
        headers: { "Content-Type": "application/json" },
      });
      expect(req.status).toBe(401);
    });

    test("PUT /users/:id", async () => {
      const req = await fetch(`http://localhost:${testPort}/users/1`, {
        method: "PUT",
        body: JSON.stringify({ username: "user1-updated" }),
        headers: { "Content-Type": "application/json" },
      });
      expect(req.status).toBe(401);
    });
  });
});
