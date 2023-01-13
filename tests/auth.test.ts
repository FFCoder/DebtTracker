import {
  beforeAll,
  afterAll,
  describe,
  test,
  expect,
  jest,
} from "@jest/globals";
import User from "../src/models/User.model";
import server from "../src/server";

let testServer: any;
let testPort: number;

describe("Auth API Tests", () => {
  beforeAll(async () => {
    // Generate a random port for the test server
    testPort = Math.floor(Math.random() * 10000) + 10000;
    testServer = server.listen(testPort);

    // Create a user
    await User.sync({ force: true });
    await User.create({
      username: "testUser",
      password: "testPassword",
    });
  });

  afterAll(() => {
    testServer.close();
  });
  test("POST /login Valid Login", async () => {
    // Login with the user
    // Expect a token to be returned
    const req = await fetch(`http://localhost:${testPort}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username: "testUser", password: "testPassword" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await req.json();
    console.log(response);
    expect(response.token).toBeDefined();
  });

  test("POST /login Invalid Login", async () => {
    // Login with the user
    // Expect a token to be returned
    const req = await fetch(`http://localhost:${testPort}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username: "testUser2", password: "invalid" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(req.status).toBe(401);
    const response = await req.json();

    expect(response.token).toBeUndefined();
    expect(response.message).toBeDefined();
    expect(response.message).toBe("Invalid username or password");
  });

  test("POST /register Valid Data", async () => {
    // Register a new user
    // Expect a token to be returned
    const req = await fetch(`http://localhost:${testPort}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ username: "testUser2", password: "testPassword" }),
      headers: { "Content-Type": "application/json" },
    });
    const response = await req.json();
    expect(response.token).toBeDefined();

    // Check that the user was created
    const user = await User.findOne({ where: { username: "testUser2" } });
    expect(user).toBeDefined();

    // Check that the password was hashed
    expect(user?.password).not.toBe("testPassword");

    // Delete the user
    await user?.destroy();
  });
});
