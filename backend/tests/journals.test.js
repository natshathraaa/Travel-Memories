const request = require("supertest");
const app = require("../app");
const { registerAndLogin } = require("./testUtils");

describe("Journal API", () => {
  it("creates a journal when authenticated", async () => {
    const { token } = await registerAndLogin({ email: "journal@example.com" });

    const payload = {
      placeName: "Ooty",
      date: "2025-02-01",
      story: "Test story for journal",
      photos: [],
      tags: ["test"],
      location: {
        city: "Ooty",
        state: "Tamil Nadu",
        country: "India",
        latitude: 11.4064,
        longitude: 76.6932,
      },
      isPublic: false,
      isFavorite: false,
    };

    const response = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.placeName).toBe("Ooty");
    expect(response.body.story).toBe(payload.story);
  });
});
