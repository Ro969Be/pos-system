import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import shopJobsRouter from "../routes/shopJobs.routes.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Message from "../models/Message.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/jobs", shopJobsRouter);

function authHeader() {
  const token = jwt.sign(
    {
      userId: "user-1",
      storeId: "507f1f77bcf86cd799439011",
      roles: ["Admin"],
    },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Jobs & Applications", () => {
  afterEach(() => jest.restoreAllMocks());

  it("creates job and application, updates status", async () => {
    jest.spyOn(Job, "find").mockReturnValue({ sort: () => ({ lean: () => Promise.resolve([]) }) });
    const createJob = jest.spyOn(Job, "create").mockResolvedValue({ _id: "job1" });
    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/jobs")
      .set(authHeader())
      .send({ title: "Chef", description: "Cook meals" })
      .expect(201);
    expect(createJob).toHaveBeenCalled();

    jest.spyOn(JobApplication, "find").mockReturnValue({ sort: () => ({ lean: () => Promise.resolve([]) }) });
    const createApp = jest.spyOn(JobApplication, "create").mockResolvedValue({ _id: "app1" });
    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/jobs/job1/applications")
      .set(authHeader())
      .send({ applicantName: "Alice", email: "alice@example.com" })
      .expect(201);
    expect(createApp).toHaveBeenCalled();

    jest.spyOn(JobApplication, "findOneAndUpdate").mockReturnValue({ lean: () => Promise.resolve({ status: "interview" }) });
    await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/jobs/job1/applications/app1")
      .set(authHeader())
      .send({ status: "interview" })
      .expect(200);
  });

  it("adds messages to application thread", async () => {
    jest.spyOn(Message, "find").mockReturnValue({ sort: () => ({ lean: () => Promise.resolve([]) }) });
    jest.spyOn(Message, "create").mockResolvedValue({ _id: "msg1" });
    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/jobs/job1/applications/app1/messages")
      .set(authHeader())
      .send({ body: "Hello candidate" })
      .expect(201);
  });
});
