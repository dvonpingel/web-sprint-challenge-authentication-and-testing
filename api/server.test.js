const server = require("./server");
const request = require("supertest");
const db = require("../data/dbConfig");

test("sanity", () => {
  expect(true).toBe(true);
});

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});
beforeEach(async () => {
  await db("users").truncate();
});
afterAll(async () => {
  await db.destroy();
});

it('knows process.env.NODE_ENV to be in "testing" mode', () => {
  expect(process.env.NODE_ENV).toBe("testing");
});

describe("Auth Endpoints", () => {
  describe("[POST] /api/auth/register", () => {
    it("(1) creates a new user in database", async () => {
      const res = await request(server).post("/api/auth/register").send({
        username: "dart",
        password: "123",
      });
      expect(res.body).toMatchObject({ id: 1, username: "dart" });
    });

    it("(2) responds with proper message if username is taken", async () => {
      const user1 = await request(server).post("/api/auth/register").send({
        username: "dart",
        password: "123",
      });
      expect(user1.body).toMatchObject({ id: 1, username: "dart" });
      const user2 = await request(server).post("/api/auth/register").send({
        username: "dart",
        password: "123",
      });
      expect(user2.body.message).toMatch(/username taken/);
    });
  });

  describe("[POST] /api/auth/login", () => {
    let res;

    beforeEach(async () => {
      await request(server).post("/api/auth/register").send({
        username: "dart",
        password: "123",
      });
    });

    it("(1) logs in with correct user greeting", async () => {
      res = await request(server).post("/api/auth/login").send({
        username: "dart",
        password: "123",
      });
      expect(res.body.message).toMatch(/welcome, dart/);
    });

    it("(2) returns correct error message if credentials[username] are incorrect", async () => {
      res = await request(server).post("/api/auth/login").send({
        username: "darticus",
        password: "123",
      });
      expect(res.body.message).toMatch(/invalid credentials/);
    });
  });

  describe("[GET] /api/jokes", () => {
    it("(1) responds with jokes if token is correct", async () => {
      await request(server).post("/api/auth/register").send({
        username: "darticus",
        password: "123",
      });
      let res = await request(server).post("/api/auth/login").send({
        username: "darticus",
        password: "123",
      });
      const theToken = res.body.token;
      res = await request(server)
        .get("/api/jokes")
        .set({ Authorization: theToken });
      expect(res.body[0]).toMatchObject({
        id: "0189hNRf2g",
        joke:
          "I'm tired of following my dreams. I'm just going to ask them where they are going and meet up with them later.",
      });
    });

    it("(2) fails to send jokes with correct error message on bad token", async () => {
      const theToken = "bard";
      const res = await request(server)
        .get("/api/jokes")
        .set({ Authorization: theToken });
      expect(res.body.message).toMatch(/token invalid/);
    });
  });
});
