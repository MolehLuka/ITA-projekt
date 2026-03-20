import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgres://test:test@localhost:5432/test";

const { createServer } = await import("../dist/app.js");
const { pool } = await import("../dist/db.js");

const app = createServer();

const mockQuery = (result) => {
  pool.query = async () => result;
};

test("GET /health returns 503 when db down", async () => {
  pool.query = async () => {
    throw new Error("db down");
  };

  const response = await request(app).get("/health");
  assert.equal(response.status, 503);
});

test("POST /members/register returns 409 on conflict", async () => {
  mockQuery({ rowCount: 1, rows: [] });

  const response = await request(app)
    .post("/members/register")
    .send({ username: "user", email: "user@example.com", password: "secret" });

  assert.equal(response.status, 409);
});

test("POST /members/login returns 401 for missing user", async () => {
  mockQuery({ rowCount: 0, rows: [] });

  const response = await request(app)
    .post("/members/login")
    .send({ email: "user@example.com", password: "secret" });

  assert.equal(response.status, 401);
});

test("GET /members/me requires auth", async () => {
  const response = await request(app).get("/members/me");
  assert.equal(response.status, 401);
});

test("PATCH /members/me requires auth", async () => {
  const response = await request(app)
    .patch("/members/me")
    .send({ firstName: "Test" });

  assert.equal(response.status, 401);
});

test("POST /members/change-password requires auth", async () => {
  const response = await request(app)
    .post("/members/change-password")
    .send({ currentPassword: "old", newPassword: "new" });

  assert.equal(response.status, 401);
});

test("GET /members/:id requires auth", async () => {
  const response = await request(app).get("/members/1");
  assert.equal(response.status, 401);
});

test("GET /members/:id/status requires auth", async () => {
  const response = await request(app).get("/members/1/status");
  assert.equal(response.status, 401);
});

test("POST /members/:id/status requires auth", async () => {
  const response = await request(app)
    .post("/members/1/status")
    .send({ status: "active" });

  assert.equal(response.status, 401);
});

test("GET /members/:id/membership requires auth", async () => {
  const response = await request(app).get("/members/1/membership");
  assert.equal(response.status, 401);
});

test("POST /members/:id/membership/renew requires auth", async () => {
  const response = await request(app)
    .post("/members/1/membership/renew")
    .send({ durationDays: 30 });

  assert.equal(response.status, 401);
});

test("POST /members/:id/membership/cancel requires auth", async () => {
  const response = await request(app).post("/members/1/membership/cancel");
  assert.equal(response.status, 401);
});
