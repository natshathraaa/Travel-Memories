const request = require("supertest");
const app = require("../app");

const registerAndLogin = async (overrides = {}) => {
  const user = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    ...overrides,
  };

  await request(app).post("/api/auth/register").send(user).expect(201);
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password })
    .expect(200);

  return { user, token: loginResponse.body.token };
};

module.exports = { registerAndLogin };
