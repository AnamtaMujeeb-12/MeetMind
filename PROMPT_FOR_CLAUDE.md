# Prompt for Claude – Build MeetMind AI from scratch

Act as a senior full-stack developer and a patient coding mentor. Build the project **MeetMind AI – AI-Based Meeting Insight and Action System** from scratch.

## Time and scope
This is a 24-hour academic project MVP. Prioritize a working end-to-end flow over advanced features. Do NOT build a Chrome extension, Google Meet integration, Zoom integration, live recording, or real-time meeting capture. Users will upload a pre-recorded audio file.

## Required stack
- Frontend: React + Vite + plain CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- Audio transcription: OpenAI Whisper API (`whisper-1`)
- Meeting analysis: OpenAI Chat Completions API, default model `gpt-4o-mini`
- Email reminders: Nodemailer (optional SMTP)
- Use JavaScript, not TypeScript. Do not introduce Python.

## Required features
1. User registration, login and protected routes.
2. Dashboard showing meeting records and status.
3. Create a meeting with title and date.
4. Upload an audio recording (maximum 25 MB for this MVP).
5. Transcribe the audio using Whisper.
6. Analyze transcript and return structured JSON:
   - summary
   - discussion_points
   - decisions
   - action_items (title, assignee, deadline)
7. Save user, meeting, transcript, insights and tasks in MongoDB.
8. Meeting detail page showing all extracted information.
9. Task management: edit assignee, deadline and status (Pending, In Progress, Completed).
10. My Tasks page aggregating tasks across meetings.
11. Optional email reminder using Nodemailer.
12. Meeting deletion and audio file cleanup.

## Required project structure
Keep filenames short, readable and use snake_case where appropriate. Separate routes, models, middleware, services, config and frontend components. Keep frontend and backend in `client` and `server`.

## API endpoints
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/api/meetings`
- POST `/api/meetings`
- GET `/api/meetings/:id`
- POST `/api/meetings/:id/upload`
- DELETE `/api/meetings/:id`
- GET `/api/tasks`
- PATCH `/api/tasks/:meeting_id/:task_id`
- POST `/api/tasks/:meeting_id/:task_id/remind`
- GET `/api/health`

## Important implementation rules
- Every meeting and task query must be restricted to the logged-in user.
- Hash passwords. Never return password hashes.
- Validate required fields and file types/sizes.
- Do not expose API keys in frontend code.
- Use clear error messages and loading states.
- Do not pretend AI succeeded if the API call failed.
- Do not fabricate transcript content or meeting insights.
- Handle malformed AI JSON safely and show a useful error.
- Use environment variables and provide `.env.example`.
- Keep the UI clean, responsive and easy to explain in a college viva.
- Add comments only where they clarify non-obvious logic.
- Do not add complex state libraries, Docker, microservices, or unnecessary packages.

## Deliverables
1. Complete runnable source code with all imports and files connected.
2. Root README with exact setup commands for Windows PowerShell.
3. `.env.example` with every required variable.
4. Explain the role of every folder and important file.
5. Explain the frontend-to-backend-to-database flow.
6. Give a step-by-step manual test checklist.
7. List known limitations and any API costs.
8. Before finishing, inspect all imports, endpoint paths, request field names, response shapes and package dependencies for consistency.
9. Run a production frontend build and fix errors if your environment permits.

I am a beginner. Do not just dump code. Explain exactly which terminal to open, which folder to enter, what command to run, where to create `.env`, how to obtain credentials, and how to test each feature. If a decision is ambiguous, choose the simplest reliable option and explain it.
