import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import reservationRouter from "../routes/shopReservations.routes.js";
import slotRouter from "../routes/shopSlots.routes.js";
import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";
import ReservationSlot from "../models/ReservationSlot.js";

process.env.JWT_SECRET = "test-secret";

const app = express();
app.use(express.json());
app.use("/api/shops/:shopId/reservations", reservationRouter);
app.use("/api/shops/:shopId/slots", slotRouter);

function authHeader() {
  const token = jwt.sign(
    {
      userId: "user-1",
      roles: ["Admin"],
      bindings: [{ shopId: "507f1f77bcf86cd799439011", role: "Admin" }],
    },
    process.env.JWT_SECRET
  );
  return { Authorization: `Bearer ${token}` };
}

describe("Reservations & Slots", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a reservation with auto-assigned table", async () => {
    jest.spyOn(Table, "find").mockReturnValue({
      sort: () => ({
        lean: () =>
          Promise.resolve([{ _id: "t1", capacity: 4 }]),
      }),
    });
    jest.spyOn(Reservation, "find").mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([]),
      }),
      sort: () => ({
        lean: () => Promise.resolve([]),
      }),
      lean: () => Promise.resolve([]),
    });
    const createSpy = jest
      .spyOn(Reservation, "create")
      .mockResolvedValue({ _id: "r1", customerName: "Alice" });

    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/reservations")
      .set(authHeader())
      .send({
        customerName: "Alice",
        startTime: "2025-11-15T12:00:00.000Z",
        partySize: { total: 2 },
      })
      .expect(201);

    expect(createSpy).toHaveBeenCalled();
    const payload = createSpy.mock.calls[0][0];
    expect(payload.tableId).toBe("t1");
    expect(payload.status).toBe("hold");
    expect(payload.holdExpiresAt).toBeInstanceOf(Date);
  });

  it("updates reservation status from hold to confirmed", async () => {
    const save = jest.fn().mockResolvedValue(true);
    jest.spyOn(Reservation, "findOne").mockResolvedValue({
      _id: "r1",
      shopId: "507f1f77bcf86cd799439011",
      customerName: "Alice",
      contactPhone: "",
      contactEmail: "",
      partySize: { total: 2, adult: 2, child: 0 },
      startTime: new Date("2025-11-15T12:00:00.000Z"),
      endTime: new Date("2025-11-15T13:30:00.000Z"),
      tableId: "t1",
      memo: "",
      tags: [],
      channel: "Front",
      status: "hold",
      holdExpiresAt: new Date(),
      save,
      toObject() {
        return { _id: "r1", status: "confirmed" };
      },
    });
    jest.spyOn(Table, "find").mockReturnValue({
      sort: () => ({
        lean: () => Promise.resolve([{ _id: "t1", capacity: 4 }]),
      }),
    });
    jest.spyOn(Reservation, "find").mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([]),
      }),
      sort: () => ({
        lean: () => Promise.resolve([]),
      }),
      lean: () => Promise.resolve([]),
    });

    const res = await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/reservations/r1")
      .set(authHeader())
      .send({ status: "confirmed" })
      .expect(200);

    expect(save).toHaveBeenCalled();
    expect(res.body.status).toBe("confirmed");
  });

  it("creates and edits slots", async () => {
    const doc = { _id: "slot1", openFlag: "open" };
    jest.spyOn(ReservationSlot, "findOneAndUpdate").mockReturnValueOnce({
      lean: () => Promise.resolve(doc),
    }).mockReturnValueOnce({
      lean: () => Promise.resolve({ ...doc, openFlag: "休" }),
    });

    await request(app)
      .post("/api/shops/507f1f77bcf86cd799439011/slots")
      .set(authHeader())
      .send({ date: "2025-11-15", time: "18:00", openFlag: "open" })
      .expect(201);

    const res = await request(app)
      .patch("/api/shops/507f1f77bcf86cd799439011/slots/slot1")
      .set(authHeader())
      .send({ openFlag: "休" })
      .expect(200);

    expect(res.body.openFlag).toBe("休");
  });
});
