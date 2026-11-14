# MeetMind AI

A student-friendly AI meeting insight and task management web app.

## Features
- Register and login with JWT authentication
- Create meetings and upload recorded audio
- Transcribe audio using OpenAI Whisper (`whisper-1`)
- Generate summary, discussion points, decisions and action items using an OpenAI chat model
- Save meetings and tasks in MongoDB
- Assign tasks, set deadlines and update task status
- Email reminders through Nodemailer (optional SMTP configuration)
- Meeting history and meeting detail pages

**No Chrome extension or live Google Meet capture is included.** Users record meetings separately and upload the audio file.

## Requirements
- Node.js 18+
- MongoDB Atlas connection string (or local MongoDB)
- OpenAI API key with API access/credits
- Optional SMTP account for email reminders

## 1. Configure the backend

Open a terminal in `server`:

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:
- `MONGO_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY`

The AI flow uses OpenAI audio transcription and Chat Completions. API usage may incur charges. The app does not include an API subscription.

## 2. Configure the frontend

Open another terminal in `client`:

```bash
npm install
```

## 3. Run the app

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2:

```bash
cd client
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## 4. First test
1. Register an account.
2. Log in.
3. Create a meeting.
4. Upload a short meeting recording (start with 30–60 seconds).
5. Wait for transcription and AI analysis.
6. Open the meeting to see its summary, decisions and action items.
7. Update a task's status or edit its assignee/deadline.

Use a short test recording first. The OpenAI transcription endpoint has upload limits; long recordings may need to be compressed or split. The starter app limits uploads to 25 MB.

## Email reminders
Email reminders are optional. Add SMTP values to `server/.env`. If SMTP is not configured, the app still works; the API will report that email is not configured when a reminder is requested.

## Important notes
- Keep `.env` private. Never commit API keys or database credentials to GitHub.
- This is an academic MVP, not a production-secure deployment.
- Users must have permission to record and upload meeting audio.
- AI-extracted names, tasks and deadlines can be wrong. Review them before assigning work.
- The app supports the intended Hindi/English/Hinglish workflow to the extent supported by the selected transcription and language model; test with your actual recordings.
