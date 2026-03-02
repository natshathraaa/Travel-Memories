const request = require("supertest");
const app = require("../app");
const { registerAndLogin } = require("./testUtils");

describe("Protected routes", () => {
  it("fails without a token", async () => {
    const response = await request(app).get("/api/journals");
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/token/i);
  });

  it("passes with a valid token", async () => {
    const { token } = await registerAndLogin();
    const response = await request(app)
      .get("/api/journals")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
