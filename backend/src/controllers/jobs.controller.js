import mongoose from "mongoose";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Message from "../models/Message.js";

function ensureShop(shopId) {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    const err = new Error("Invalid shopId");
    err.statusCode = 400;
    throw err;
  }
  return shopId;
}

export async function listJobs(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const jobs = await Job.find({ shopId }).sort({ createdAt: -1 }).lean();
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

export async function createJob(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const job = await Job.create({
      shopId,
      storeId: shopId,
      title: req.body.title,
      description: req.body.description,
      employmentType: req.body.employmentType,
      salary: req.body.salary,
      location: req.body.location,
      tags: req.body.tags,
      status: req.body.status || "draft",
      createdBy: req.user?.userId,
    });
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const job = await Job.findOneAndDelete({ _id: req.params.jobId, shopId }).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });
    await JobApplication.deleteMany({ jobId: job._id });
    await Message.deleteMany({ jobId: job._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function listApplications(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const jobId = req.params.jobId;
    const apps = await JobApplication.find({ shopId, jobId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

export async function createApplication(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const jobId = req.params.jobId;
    const app = await JobApplication.create({
      shopId,
      storeId: shopId,
      jobId,
      applicantName: req.body.applicantName,
      email: req.body.email,
      phone: req.body.phone,
      resumeUrl: req.body.resumeUrl,
      status: "new",
      source: req.body.source,
    });
    res.status(201).json(app);
  } catch (err) {
    next(err);
  }
}

export async function updateApplication(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const app = await JobApplication.findOneAndUpdate(
      { _id: req.params.applicationId, jobId: req.params.jobId, shopId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const { jobId, applicationId } = req.params;
    const messages = await Message.find({
      shopId,
      jobId,
      applicationId,
    })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

export async function createMessage(req, res, next) {
  try {
    const shopId = ensureShop(req.params.shopId);
    const msg = await Message.create({
      shopId,
      storeId: shopId,
      jobId: req.params.jobId,
      applicationId: req.params.applicationId,
      senderType: req.body.senderType || "staff",
      body: req.body.body,
      createdBy: req.user?.userId,
    });
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}
