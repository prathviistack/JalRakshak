const request = require("supertest");
const app = require("../src/app");
const { connect, clearDatabase, disconnect } = require("./setupTestDb");

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe("Auth API", () => {
  const victim = {
    name: "Test Victim",
    email: "victim@test.com",
    password: "password123",
    role: "victim",
    district: "Kamrup",
  };

  test("GET /api/health returns success", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("registers a new user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send(victim);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(victim.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test("rejects registration with a duplicate email", async () => {
    await request(app).post("/api/auth/register").send(victim);
    const res = await request(app).post("/api/auth/register").send(victim);
    expect(res.status).toBe(400);
  });

  test("rejects registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...victim, email: "not-an-email" });
    expect(res.status).toBe(400);
  });

  test("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(victim);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: victim.email, password: victim.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(victim);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: victim.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/profile requires a token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  test("GET /api/auth/profile returns the user when authenticated", async () => {
    const registerRes = await request(app).post("/api/auth/register").send(victim);
    const token = registerRes.body.accessToken;

    const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(victim.email);
  });
});
