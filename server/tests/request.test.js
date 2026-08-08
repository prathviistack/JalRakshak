const request = require("supertest");
const app = require("../src/app");
const { connect, clearDatabase, disconnect } = require("./setupTestDb");

let victimToken;
let volunteerToken;

const registerAndLogin = async (overrides) => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test User",
      email: `${overrides.role}@test.com`,
      password: "password123",
      ...overrides,
    });
  return res.body.accessToken;
};

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
  await connect();
});

beforeEach(async () => {
  victimToken = await registerAndLogin({ role: "victim", district: "Nagaon" });
  volunteerToken = await registerAndLogin({ role: "volunteer", district: "Nagaon" });
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnect();
});

const validRequestPayload = {
  type: "rescue",
  urgency: "high",
  description: "Water rising fast near the house, need evacuation.",
  numberOfPeople: 3,
  district: "Nagaon",
  address: "Near Kolong bridge",
  lng: 92.68,
  lat: 26.35,
};

describe("Emergency Request API", () => {
  test("victim can create an SOS request", async () => {
    const res = await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${victimToken}`)
      .send(validRequestPayload);

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe("pending");
    expect(res.body.request.district).toBe("Nagaon");
  });

  test("rejects request creation with missing required fields", async () => {
    const res = await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${victimToken}`)
      .send({ type: "rescue" });

    expect(res.status).toBe(400);
  });

  test("volunteer cannot create an SOS request (role-gated)", async () => {
    const res = await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${volunteerToken}`)
      .send(validRequestPayload);

    expect(res.status).toBe(403);
  });

  test("volunteer can find the request via nearby geo-query", async () => {
    await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${victimToken}`)
      .send(validRequestPayload);

    const res = await request(app)
      .get("/api/request/nearby")
      .query({ lng: 92.68, lat: 26.35, maxDistance: 50000 })
      .set("Authorization", `Bearer ${volunteerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
  });

  test("volunteer can accept a pending request", async () => {
    const createRes = await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${victimToken}`)
      .send(validRequestPayload);

    const res = await request(app)
      .put(`/api/request/update/${createRes.body.request._id}`)
      .set("Authorization", `Bearer ${volunteerToken}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe("accepted");
    expect(res.body.request.volunteer).toBeDefined();
  });

  test("victim cannot accept their own request", async () => {
    const createRes = await request(app)
      .post("/api/request/create")
      .set("Authorization", `Bearer ${victimToken}`)
      .send(validRequestPayload);

    const res = await request(app)
      .put(`/api/request/update/${createRes.body.request._id}`)
      .set("Authorization", `Bearer ${victimToken}`)
      .send({ status: "accepted" });

    expect(res.status).toBe(403);
  });
});
