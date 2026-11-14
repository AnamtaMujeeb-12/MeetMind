
import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  NavLink,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  Brain,
  LayoutDashboard,
  LogOut,
  Plus,
  Upload,
  FileAudio,
  CheckCircle2,
  Clock3,
  Trash2,
  ArrowLeft,
  ListTodo
} from "lucide-react";

import api from "./api";

// Protected routes
function Protected({ children }) {
  return localStorage.getItem("meetmind_token")
    ? children
    : <Navigate to="/login" replace />;
}

// Main layout
function Layout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("meetmind_token");
        navigate("/login");
      });
  }, []);

  function logout() {
    localStorage.removeItem("meetmind_token");
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-icon"><Brain size={22} /></span>
          MeetMind<span className="brand-ai">AI</span>
        </Link>

        <div className="nav-label">WORKSPACE</div>

        <NavLink end className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/">
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} to="/tasks">
          <ListTodo size={18} /> My Tasks
        </NavLink>

        <div className="side-bottom">
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="user-meta">
            <b>{user?.name || "Loading..."}</b>
            <small>{user?.email || ""}</small>
          </div>

          <button className="icon-btn" onClick={logout} title="Logout">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <span>AI Meeting Insight & Action System</span>
          <span className="online"><i /> Workspace</span>
        </header>

        {children}
      </main>
    </div>
  );
}

// Login and registration
function Auth({ register = false }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const r = await api.post(
        `/auth/${register ? "register" : "login"}`,
        form
      );

      localStorage.setItem("meetmind_token", r.data.token);
      navigate("/");
    } catch (e) {
      setError(
        e.response?.data?.message || "Unable to connect to server."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand auth-brand" to="/">
          <span className="brand-icon"><Brain size={22} /></span>
          MeetMind<span className="brand-ai">AI</span>
        </Link>

        <p className="eyebrow">MEETING PRODUCTIVITY, SIMPLIFIED</p>

        <h1>{register ? "Create your account" : "Welcome back"}</h1>

        <p className="muted">
          {register
            ? "Start turning conversations into action."
            : "Sign in to continue to your workspace."}
        </p>

        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="primary full" disabled={busy}>
            {busy
              ? "Please wait..."
              : register
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {register ? "Already have an account?" : "New to MeetMind?"}
          {" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create account"}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const r = await api.get("/meetings");
      setMeetings(r.data.meetings);
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not load meetings."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();

    try {
      const r = await api.post("/meetings", { title });
      setTitle("");
      setShow(false);
      navigate(`/meetings/${r.data.meeting._id}`);
    } catch (e) {
      setError(
        e.response?.data?.message || "Could not create meeting."
      );
    }
  }

  async function remove(id) {
    if (!confirm("Delete this meeting and its saved audio?")) return;

    try {
      await api.delete(`/meetings/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Delete failed.");
    }
  }

  const completed = meetings.filter(
    m => m.status === "Completed"
  ).length;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Your workspace</h1>
          <p className="muted">
            Turn meeting conversations into clear next steps.
          </p>
        </div>

        <button className="primary" onClick={() => setShow(!show)}>
          <Plus size={18} /> New meeting
        </button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <span>Total meetings</span>
          <b>{meetings.length}</b>
          <FileAudio />
        </div>

        <div className="stat-card">
          <span>Analyzed meetings</span>
          <b>{completed}</b>
          <CheckCircle2 />
        </div>

        <div className="stat-card">
          <span>In progress / failed</span>
          <b>
            {meetings.filter(
              m => m.status === "Processing" || m.status === "Failed"
            ).length}
          </b>
          <Clock3 />
        </div>
      </div>

      {show && (
        <form className="create-box" onSubmit={create}>
          <div>
            <b>Create a meeting</b>
            <p className="muted">
              Add a title before uploading its recording.
            </p>
          </div>

          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Final year project discussion"
          />

          <button className="primary">Create</button>

          <button
            type="button"
            className="secondary"
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {error && <div className="error">{error}</div>}

      <div className="section-head">
        <div>
          <h2>Recent meetings</h2>
          <p className="muted">
            Your saved meeting records and insights.
          </p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><FileAudio /></div>
          <h3>No meetings yet</h3>
          <p className="muted">
            Create your first meeting and upload an audio recording.
          </p>
          <button className="primary" onClick={() => setShow(true)}>
            <Plus size={17} /> Create meeting
          </button>
        </div>
      ) : (
        <div className="meeting-list">
          {meetings.map(m => (
            <div className="meeting-card" key={m._id}>
              <div className="meeting-symbol"><FileAudio /></div>

              <div className="meeting-info">
                <Link to={`/meetings/${m._id}`}>
                  <b>{m.title}</b>
                </Link>
                <small>
                  {new Date(m.meeting_date).toLocaleDateString()}
                  {" · "}
                  {m.action_items?.length || 0} action items
                </small>
              </div>

              <span className={`status ${m.status.toLowerCase()}`}>
                {m.status}
              </span>

              <button
                className="icon-btn danger-text"
                title="Delete meeting"
                onClick={() => remove(m._id)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Meeting details and audio upload
function MeetingDetail() {
  const { id } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const r = await api.get(`/meetings/${id}`);
      setMeeting(r.data.meeting);
    } catch (e) {
      setError(e.response?.data?.message || "Meeting not found.");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function upload(e) {
    e.preventDefault();

    if (!file) {
      return setError("Choose an audio file first.");
    }

    const data = new FormData();
    data.append("audio", file);

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const r = await api.post(
        `/meetings/${id}/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setMeeting(r.data.meeting);
      setMessage("Audio processed successfully.");
    } catch (e) {
      setError(
        e.response?.data?.message || "Audio processing failed."
      );
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!meeting) {
    return (
      <div className="page">
        <p>{error || "Loading meeting..."}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to meetings
      </Link>

      <div className="page-heading detail-heading">
        <div>
          <p className="eyebrow">MEETING DETAILS</p>
          <h1>{meeting.title}</h1>
          <p className="muted">
            {new Date(meeting.meeting_date).toLocaleString()}
          </p>
        </div>

        <span className={`status ${meeting.status.toLowerCase()}`}>
          {meeting.status}
        </span>
      </div>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      {!meeting.transcript && (
        <form className="upload-box" onSubmit={upload}>
          <div className="upload-icon"><Upload /></div>

          <div>
            <h3>Upload meeting recording</h3>
            <p className="muted">
              Choose an audio file (maximum 25 MB).
              Short recordings are recommended for your first test.
            </p>
          </div>

          <input
            type="file"
            accept="audio/*,video/webm,video/mp4"
            onChange={e => setFile(e.target.files[0])}
          />

          {file && <p className="file-name">{file.name}</p>}

          <button className="primary" disabled={busy}>
            {busy
              ? "Transcribing and analyzing..."
              : "Upload & analyze recording"}
          </button>

          <p className="tiny muted">
            Processing can take a few minutes. Keep this page open.
          </p>
        </form>
      )}

      {meeting.transcript && (
        <>
          <section className="content-card">
            <h2>Meeting summary</h2>
            <p className="summary-text">
              {meeting.summary || "No summary generated."}
            </p>
          </section>

          <div className="two-col">
            <section className="content-card">
              <h2>Discussion points</h2>
              <BulletList items={meeting.discussion_points} />
            </section>

            <section className="content-card">
              <h2>Key decisions</h2>
              <BulletList items={meeting.decisions} />
            </section>
          </div>

          <section className="content-card">
            <div className="section-head">
              <div>
                <h2>Action items</h2>
                <p className="muted">
                  Edit ownership, deadline and progress.
                </p>
              </div>
            </div>

            {meeting.action_items?.length ? (
              meeting.action_items.map(t => (
                <TaskRow
                  key={t._id}
                  task={t}
                  meetingId={id}
                  refresh={load}
                />
              ))
            ) : (
              <p className="muted">
                No action items were extracted.
              </p>
            )}
          </section>

          <details className="content-card transcript">
            <summary>View full transcript</summary>
            <p>{meeting.transcript}</p>
          </details>
        </>
      )}
    </div>
  );
}

// Discussion points and decisions
function BulletList({ items = [] }) {
  return items.length ? (
    <ul className="bullet-list">
      {items.map((x, i) => <li key={i}>{x}</li>)}
    </ul>
  ) : (
    <p className="muted">No information extracted.</p>
  );
}

// Individual task row
function TaskRow({ task, meetingId, refresh }) {
  const initialAssignee =
    task.assignee &&
      !["unassigned", "team"].includes(
        String(task.assignee).trim().toLowerCase()
      )
      ? task.assignee
      : "";

  const [status, setStatus] = useState(task.status);
  const [assignee, setAssignee] = useState(initialAssignee);

  const [deadline, setDeadline] = useState(
    task.deadline
      ? new Date(task.deadline).toISOString().slice(0, 10)
      : ""
  );

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function save() {
    setBusy(true);
    setNote("");

    try {
      await api.patch(`/tasks/${meetingId}/${task._id}`, {
        status,
        assignee: assignee.trim(),
        deadline
      });

      setNote("Saved");
      await refresh();
    } catch (e) {
      setNote(e.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="task-row">
      <div className="task-title">
        <b>{task.title}</b>

        <small>
          {assignee
            ? `Assigned to: ${assignee}`
            : "Assignment needs confirmation"}
        </small>
      </div>

      <input
        aria-label="Assignee"
        value={assignee}
        onChange={e => setAssignee(e.target.value)}
        placeholder="Select assignee or enter name"
      />

      <input
        aria-label="Deadline"
        type="date"
        value={deadline}
        onChange={e => setDeadline(e.target.value)}
      />

      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
      >
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <div className="task-actions">
        <button
          className="small-btn"
          onClick={save}
          disabled={busy}
        >
          {busy ? "Saving" : "Save"}
        </button>

      </div>

      {note && <small className="task-note">{note}</small>}
    </div>
  );
}

// My tasks page - grouped by meeting
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/tasks")
      .then(r => setTasks(r.data.tasks || []))
      .catch(e => {
        setError(
          e.response?.data?.message || "Could not load tasks."
        );
      });
  }, []);

  const groupedTasks = tasks.reduce((groups, task) => {
    const key = task.meeting_id || "other";
    if (!groups[key]) {
      groups[key] = {
        id: key,
        title: task.meeting_title || "Other tasks",
        tasks: []
      };
    }
    groups[key].tasks.push(task);
    return groups;
  }, {});

  const meetings = Object.values(groupedTasks);
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const pendingCount = tasks.filter(t => t.status === "Pending").length;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE / TASKS</p>
          <h1>My tasks</h1>
          <p className="muted">
            Follow up on the actions captured across your meetings.
          </p>
        </div>
        <div className="task-total">
          <span>{tasks.length}</span>
          <small>Total actions</small>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {tasks.length > 0 && (
        <div className="task-overview">
          <div className="task-overview-card">
            <span className="overview-dot all-dot" />
            <div><b>{tasks.length}</b><small>All tasks</small></div>
          </div>
          <div className="task-overview-card">
            <span className="overview-dot pending-dot" />
            <div><b>{pendingCount}</b><small>Pending</small></div>
          </div>
          <div className="task-overview-card">
            <span className="overview-dot done-dot" />
            <div><b>{completedCount}</b><small>Completed</small></div>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty">
          <div className="empty-icon"><ListTodo /></div>
          <h3>No tasks yet</h3>
          <p className="muted">
            Action items will appear here after a meeting is analyzed.
          </p>
          <Link className="primary" to="/">View meetings</Link>
        </div>
      ) : (
        <div className="task-meeting-groups">
          {meetings.map((meeting, index) => {
            const done = meeting.tasks.filter(t => t.status === "Completed").length;
            return (
              <section className="task-meeting-card" key={meeting.id}>
                <div className="task-meeting-heading">
                  <div className="meeting-heading-icon"><FileAudio size={19} /></div>
                  <div className="task-meeting-name">
                    <span className="eyebrow">MEETING {String(index + 1).padStart(2, "0")}</span>
                    <h2>{meeting.title}</h2>
                    <small>{meeting.tasks.length} {meeting.tasks.length === 1 ? "task" : "tasks"} · {done} completed</small>
                  </div>
                  <Link className="text-link" to={`/meetings/${meeting.id}`}>
                    View meeting <ArrowLeft className="arrow-forward" size={15} />
                  </Link>
                </div>

                <div className="group-progress">
                  <span style={{ width: `${meeting.tasks.length ? (done / meeting.tasks.length) * 100 : 0}%` }} />
                </div>

                <div className="group-task-list">
                  {meeting.tasks.map(task => {
                    const assigned = task.assignee &&
                      !["unassigned", "team"].includes(String(task.assignee).trim().toLowerCase());
                    return (
                      <div className="group-task-row" key={task._id}>
                        <div className={`task-check ${task.status === "Completed" ? "is-done" : ""}`}>
                          {task.status === "Completed" && <CheckCircle2 size={15} />}
                        </div>
                        <div className="group-task-main">
                          <b className={task.status === "Completed" ? "completed-task" : ""}>{task.title}</b>
                          <small>{assigned ? `Assigned to ${task.assignee}` : "Assignment needs confirmation"}</small>
                        </div>
                        <div className="group-task-deadline">
                          <small>DEADLINE</small>
                          <span>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</span>
                        </div>
                        <span className={`status ${String(task.status || "Pending").toLowerCase().replace(" ", "-")}`}>
                          {task.status || "Pending"}
                        </span>
                        <Link className="icon-btn task-open" title="Open meeting" to={`/meetings/${meeting.id}`}>
                          <ArrowLeft className="arrow-forward" size={17} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Application routes
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth register />} />

      <Route
        path="/"
        element={
          <Protected>
            <Layout>
              <Dashboard />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/meetings/:id"
        element={
          <Protected>
            <Layout>
              <MeetingDetail />
            </Layout>
          </Protected>
        }
      />

      <Route
        path="/tasks"
        element={
          <Protected>
            <Layout>
              <Tasks />
            </Layout>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
