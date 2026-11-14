
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middleware/auth.js";
import Meeting from "../models/Meeting.js";
import {
  transcribe_audio,
  analyze_transcript
} from "../services/ai_service.js";

const router = Router();

const upload_dir = path.resolve("uploads");
fs.mkdirSync(upload_dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, upload_dir),
  filename: (_req, file, cb) =>
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`
    )
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      /\.(mp3|wav|m4a|mp4|mpeg|mpga|webm|ogg)$/i.test(
        file.originalname
      );

    cb(
      allowed
        ? null
        : new Error(
            "Unsupported audio format. Use MP3, WAV, M4A, MP4, MPEG, WEBM or OGG."
          ),
      allowed
    );
  }
});

// Get all meetings
router.get("/", auth, async (req, res, next) => {
  try {
    const meetings = await Meeting.find({
      user: req.user_id
    })
      .sort({ createdAt: -1 })
      .select("-transcript -audio_path");

    res.json({ meetings });
  } catch (e) {
    next(e);
  }
});

// Create meeting
router.post("/", auth, async (req, res, next) => {
  try {
    if (!req.body.title?.trim()) {
      return res.status(400).json({
        message: "Meeting title is required."
      });
    }

    const meeting = await Meeting.create({
      user: req.user_id,
      title: req.body.title.trim(),
      meeting_date: req.body.meeting_date || new Date()
    });

    res.status(201).json({ meeting });
  } catch (e) {
    next(e);
  }
});

// Get one meeting
router.get("/:id", auth, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user_id
    });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found."
      });
    }

    res.json({ meeting });
  } catch (e) {
    next(e);
  }
});

// Upload audio and analyze using normal transcription
router.post("/:id/upload", auth, (req, res, next) => {
  upload.single("audio")(req, res, async (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Choose an audio file first."
      });
    }

    try {
      const meeting = await Meeting.findOne({
        _id: req.params.id,
        user: req.user_id
      });

      if (!meeting) {
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          message: "Meeting not found."
        });
      }

      meeting.status = "Processing";
      meeting.audio_path = req.file.path;
      await meeting.save();

      try {
        const transcript = await transcribe_audio(req.file.path);

        if (!transcript.trim()) {
          throw new Error("No speech was detected in the audio.");
        }

        const insights = await analyze_transcript(
          transcript,
          meeting.meeting_date
        );

        meeting.transcript = transcript;
        meeting.summary = insights.summary;
        meeting.discussion_points = insights.discussion_points;
        meeting.decisions = insights.decisions;
        meeting.action_items = insights.action_items;
        meeting.status = "Completed";

        await meeting.save();

        res.json({
          message: "Meeting analyzed successfully.",
          meeting
        });
      } catch (ai_error) {
        meeting.status = "Failed";
        await meeting.save();

        res.status(502).json({
          message: `AI processing failed: ${ai_error.message}`,
          meeting_id: meeting._id
        });
      }
    } catch (e) {
      next(e);
    }
  });
});

// Analyze a speaker-labelled transcript
router.post("/:id/analyze-speaker-transcript", auth, async (req, res, next) => {
  try {
    const transcript = req.body.transcript;

    if (
      typeof transcript !== "string" ||
      !transcript.trim()
    ) {
      return res.status(400).json({
        message: "A speaker-labelled transcript is required."
      });
    }

    const meeting = await Meeting.findOne({
      _id: req.params.id,
      user: req.user_id
    });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found."
      });
    }

    meeting.status = "Processing";
    await meeting.save();

    try {
      const insights = await analyze_transcript(
        transcript,
        meeting.meeting_date
      );

      meeting.transcript = transcript;
      meeting.summary = insights.summary;
      meeting.discussion_points = insights.discussion_points;
      meeting.decisions = insights.decisions;
      meeting.action_items = insights.action_items;
      meeting.status = "Completed";

      await meeting.save();

      res.json({
        message: "Speaker-labelled meeting analyzed successfully.",
        meeting
      });
    } catch (ai_error) {
      meeting.status = "Failed";
      await meeting.save();

      res.status(502).json({
        message: `AI processing failed: ${ai_error.message}`,
        meeting_id: meeting._id
      });
    }
  } catch (e) {
    next(e);
  }
});

// Delete meeting
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      user: req.user_id
    });

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found."
      });
    }

    if (
      meeting.audio_path &&
      fs.existsSync(meeting.audio_path)
    ) {
      fs.unlinkSync(meeting.audio_path);
    }

    res.json({
      message: "Meeting deleted."
    });
  } catch (e) {
    next(e);
  }
});

export default router;