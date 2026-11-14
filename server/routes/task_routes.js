import { Router } from "express";
import auth from "../middleware/auth.js";
import Meeting from "../models/Meeting.js";
import nodemailer from "nodemailer";

const router = Router();

router.get("/", auth, async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ user: req.user_id }).select("title action_items");
    const tasks = meetings.flatMap((meeting) => meeting.action_items.map((task) => ({
      ...task.toObject(), meeting_id: meeting._id, meeting_title: meeting.title
    })));
    res.json({ tasks });
  } catch (e) { next(e); }
});

router.patch("/:meeting_id/:task_id", auth, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.meeting_id, user: req.user_id });
    if (!meeting) return res.status(404).json({ message: "Meeting not found." });
    const task = meeting.action_items.id(req.params.task_id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    const { title, assignee, deadline, status } = req.body;
    if (title !== undefined) task.title = title;
    if (assignee !== undefined) task.assignee = assignee;
    if (deadline !== undefined) task.deadline = deadline || null;
    if (["Pending", "In Progress", "Completed"].includes(status)) task.status = status;
    await meeting.save();
    res.json({ message: "Task updated.", task });
  } catch (e) { next(e); }
});

router.post("/:meeting_id/:task_id/remind", auth, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.meeting_id, user: req.user_id });
    if (!meeting) return res.status(404).json({ message: "Meeting not found." });
    const task = meeting.action_items.id(req.params.task_id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
      return res.status(400).json({ message: "Email is not configured. Add SMTP settings in server/.env." });
    }
    const user = await (await import("../models/User.js")).default.findById(req.user_id);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, to: user.email,
      subject: `MeetMind reminder: ${task.title}`,
      text: `Task: ${task.title}\nMeeting: ${meeting.title}\nAssignee: ${task.assignee}\nDeadline: ${task.deadline || "Not set"}\nStatus: ${task.status}`
    });
    res.json({ message: `Reminder sent to ${user.email}.` });
  } catch (e) { next(e); }
});

export default router;
