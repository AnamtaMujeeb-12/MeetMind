---
title: MeetMind
emoji: 🧠
colorFrom: indigo
colorTo: red
sdk: docker
app_port: 7860
pinned: false
short_description: AI meeting assistant for summaries, decisions and tasks.
---

# MeetMind AI

AI-based meeting insight and task management web app. Upload a recorded meeting and get a transcript, summary, discussion points, decisions and trackable action items.

## Features
- Register and login with JWT authentication
- Create meetings and upload recorded audio
- Transcribe audio with Whisper through the Groq API
- Generate summary, discussion points, decisions and action items with a Groq language model
- Hindi, English and Hinglish support
- Save meetings and tasks in MongoDB
- Assign tasks, set deadlines and update task status
- Email reminders through Nodemailer (optional SMTP configuration)
- Meeting history and meeting detail pages

**No Chrome extension or live Google Meet capture is included.** Users record meetings separately and upload the audio file.

## Tech stack
React (Vite), Node.js, Express, MongoDB (Mongoose), JWT, Groq (Whisper and LLM), Nodemailer

## Run locally

Requirements: Node.js 18+, a MongoDB Atlas connection string, a Groq API key.

Backend: in `server`, run `npm install`, copy `.env.example` to `.env` and fill in `MONGO_URI`, `JWT_SECRET` and `GROQ_API_KEY`, then run `npm run dev`.

Frontend: in `client`, run `npm install` and `npm run dev`, then open the Vite URL (normally http://localhost:5173).

## First test
1. Register and log in.
2. Create a meeting.
3. Upload a short recording (30-60 seconds, maximum 25 MB).
4. Open the meeting to see the summary, decisions and action items.
5. Edit a task's assignee, deadline or status.

## Notes
- Keep `.env` private. Never commit API keys or database credentials.
- Email reminders are optional. Without SMTP settings the app still works.
- AI-extracted names, tasks and deadlines can be wrong. Review them before assigning work.
- If nobody states a task owner's name in the meeting, the assignee stays empty and can be set manually.
- Users must have permission to record and upload meeting audio.
- This is an academic MVP, not a production-secure deployment.

## Future scope
- Automatic speaker identification (diarization) linked to participant names
- Live meeting integration