
async function groq_request(url, body) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to server/.env");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Groq API request failed"
    );
  }

  return data;
}

// 1. Convert meeting audio into text
export async function transcribe_audio(file_path) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Add it to server/.env");
  }

  const fs = await import("fs");
  const bytes = fs.readFileSync(file_path);

  const form = new FormData();

  form.append(
    "file",
    new Blob([bytes]),
    file_path.split(/[\\/]/).pop()
  );

  form.append(
    "model",
    process.env.GROQ_AUDIO_MODEL || "whisper-large-v3-turbo"
  );

  form.append("response_format", "json");

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: form
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Groq audio transcription failed"
    );
  }

  return data.text || "";
}

// 2. Analyze meeting transcript using AI
export async function analyze_transcript(
  transcript,
  meeting_date = new Date()
) {
  const meetingDate = new Date(meeting_date);

  if (Number.isNaN(meetingDate.getTime())) {
    throw new Error("Invalid meeting date.");
  }

  const meetingDateText = meetingDate.toISOString().slice(0, 10);

  const data = await groq_request(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b",

      response_format: {
        type: "json_object"
      },

      messages: [
        {
          role: "system",

          content: `
You are an accurate AI meeting assistant.

Analyze the meeting transcript and return one valid JSON object.

Required JSON structure:
{
  "summary": "Meeting summary",
  "discussion_points": [],
  "decisions": [],
  "action_items": [
    {
      "title": "Task description",
      "assignee": "Person name or empty string",
      "deadline": "YYYY-MM-DD or null"
    }
  ]
}

MEETING DATE: ${meetingDateText}

RULES:

1. LANGUAGE
- Understand Hindi, English and Hinglish.
- Preserve the actual meaning of the conversation.
- Do not omit important decisions or tasks.

2. ACTION ITEMS
- Extract all specific tasks and commitments that need to be completed.
- Include commitments involving reviewing, assigning, preparing, sharing, coordinating, testing and reporting.
- Include tasks assigned to multiple or unnamed team members.
- Do not convert every discussion point into a task.
- Keep task titles short and clear.
- Do not create duplicate tasks.

3. ASSIGNEE IDENTIFICATION
- The transcript may contain speaker labels such as "Rahul:" or "Ananya:".
- Treat these labels as the verified identity of the speaker.
- When a speaker says "I will do this", assign the task to that speaker's name.
- If a speaker explicitly assigns a task to another named person, use that person's name.
- A name being mentioned in the conversation does not mean that person is responsible.
- Do not guess speaker identities or task ownership.
- If responsibility is unclear, return an empty string ("") for assignee.
- Never use "Unassigned" or "Team" as an assignee.

4. DEADLINE IDENTIFICATION
- Interpret deadlines relative to the meeting date.
- If a day and month are mentioned without a year, use the meeting year.
- If the mentioned month has already passed and the context clearly indicates a future deadline, use the next year.
- Preserve an explicitly stated year.
- Convert dates into YYYY-MM-DD format.
- Use null if no deadline is specified.
- Never assume an unrelated historical year.

5. DECISIONS
- Include only decisions actually agreed upon.
- Keep general discussion points separate from decisions.

6. ACCURACY
- Do not invent names, tasks, dates or decisions.
- Use an empty string for unclear assignees.
- Use null for unclear or missing deadlines.
- Return valid JSON only.
`
        },

        {
          role: "user",
          content: `Analyze this meeting transcript:\n\n${transcript}`
        }
      ]
    }
  );

  const raw = data.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("AI returned an empty analysis.");
  }

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned an invalid JSON response.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error("AI returned an invalid meeting analysis.");
  }

  return {
    summary: parsed.summary || "",

    discussion_points: Array.isArray(parsed.discussion_points)
      ? parsed.discussion_points
      : [],

    decisions: Array.isArray(parsed.decisions)
      ? parsed.decisions
      : [],

    action_items: Array.isArray(parsed.action_items)
      ? parsed.action_items.map((item) => {
          const suggestedAssignee = String(
            item?.assignee || ""
          ).trim();

          const assignee =
            ["unassigned", "team"].includes(
              suggestedAssignee.toLowerCase()
            )
              ? ""
              : suggestedAssignee;

          return {
            title: String(
              item?.title || "Review meeting action"
            ),
            assignee,
            deadline: item?.deadline || null,
            status: "Pending"
          };
        })
      : []
  };
}
