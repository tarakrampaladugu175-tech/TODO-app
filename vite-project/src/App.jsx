import { useState, useEffect } from "react";

const API = "http://localhost:8000/api/tasks";
const TAGS = ["work", "personal", "urgent", "health"];

const TAG_STYLES = {
  work:     { bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  personal: { bg: "#EEEDFE", color: "#3C3489", border: "#AFA9EC" },
  urgent:   { bg: "#FCEBEB", color: "#791F1F", border: "#F09595" },
  health:   { bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
};

const STATUS_STYLES = {
  pending:       { bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
  "in-progress": { bg: "#E6F1FB", color: "#0C447C", border: "#85B7EB" },
  completed:     { bg: "#EAF3DE", color: "#27500A", border: "#97C459" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 16) return "Good afternoon";
  if (h < 20) return "Good evening";
  return "Good night";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Tag Badge ────────────────────────────────────────────────────────────────
function TagBadge({ tag }) {
  if (!tag) return null;
  const s = TAG_STYLES[tag] || {};

  // Clean, dedicated styles object (Fixed your blue override bug too!)
  const badgeStyles = {
    fontSize: 11, 
    padding: "2px 9px", 
    borderRadius: 20,
    background: s.bg, 
    color: s.color, 
    border: `0.5px solid ${s.border}`,
    fontWeight: 400,
  };

  return <span style={badgeStyles}>{tag}</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || {};

  const badgeStyles = {
    fontSize: 11, 
    padding: "2px 9px", 
    borderRadius: 20,
    background: s.bg, 
    color: s.color, 
    border: `0.5px solid ${s.border}`,
    fontWeight: 400,
  };

  return <span style={badgeStyles}>{status}</span>;
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onDelete, onStatusChange }) {
  const isDone = task.status === "completed";

  // Dedicated layout style variables
  const cardContainerStyles = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "12px 14px",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    transition: "border-color 0.15s",
    opacity: isDone ? 0.6 : 1,
  };

  const checkboxStyles = {
    width: 20, 
    height: 20, 
    borderRadius: "50%", 
    flexShrink: 0,
    border: isDone ? "none" : "1.5px solid var(--color-border-secondary)",
    background: isDone ? "#1D9E75" : "transparent",
    cursor: "pointer", 
    marginTop: 2,
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
  };

  const titleStyles = {
    fontSize: 14,
    color: "var(--color-text-primary)",
    textDecoration: isDone ? "line-through" : "none",
    marginBottom: 6,
  };

  const metaRowStyles = { 
    display: "flex", 
    gap: 6, 
    flexWrap: "wrap", 
    alignItems: "center" 
  };

  const timeStyles = { 
    fontSize: 11, 
    color: "var(--color-text-tertiary)" 
  };

  const selectDropdownStyles = {
    fontSize: 11, 
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)", 
    padding: "3px 6px",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)", 
    cursor: "pointer",
  };

  const deleteButtonStyles = {
    background: "none", 
    border: "none", 
    cursor: "pointer",
    color: "var(--color-text-tertiary)", 
    fontSize: 16,
    padding: "2px 4px", 
    flexShrink: 0,
    transition: "color 0.15s",
  };

  return (
    <div 
      style={cardContainerStyles}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-secondary)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-label={isDone ? "Mark incomplete" : "Mark complete"}
        style={checkboxStyles}
      >
        {isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.8 7L9 1" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={titleStyles}>{task.title}</div>
        <div style={metaRowStyles}>
          <TagBadge tag={task.tag} />
          <StatusBadge status={task.status} />
          <span style={timeStyles}>
            {task.created_at
              ? new Date(task.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric", minute: "2-digit"
                })
              : ""}
          </span>
        </div>
      </div>

      <select
        value={task.status}
        onChange={e => onStatusChange(task.id, e.target.value)}
        style={selectDropdownStyles}
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In progress</option>
        <option value="completed">Completed</option>
      </select>

      <button
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        style={deleteButtonStyles}
        onMouseEnter={e => e.currentTarget.style.color = "#E24B4A"}
        onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-tertiary)"}
      >
        ✕
      </button>
    </div>
  );
}

// ─── See Tasks View ───────────────────────────────────────────────────────────
function SeeTasksView({ tasks, onToggle, onDelete, onStatusChange }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = tasks.filter(t => {
    const matchesFilter = filter === "all" || t.status === filter || t.tag === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { label: "All",         value: "all" },
    { label: "Pending",     value: "pending" },
    { label: "In progress", value: "in-progress" },
    { label: "Completed",   value: "completed" },
  ];

  // Isolated styles
  const searchWrapperStyles = { position: "relative", marginBottom: 12 };
  const searchIconStyles = {
    position: "absolute", left: 12, top: "50%",
    transform: "translateY(-50%)",
    color: "var(--color-text-tertiary)", fontSize: 14,
    pointerEvents: "none",
  };
  const searchInputStyles = {
    width: "100%", padding: "9px 12px 9px 32px",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)", fontSize: 14, outline: "none",
  };
  const filterRowStyles = { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 };
  const emptyStateStyles = {
    textAlign: "center", padding: "2.5rem 1rem",
    color: "var(--color-text-tertiary)", fontSize: 14,
    border: "0.5px dashed var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
  };
  const listWrapperStyles = { display: "flex", flexDirection: "column", gap: 8 };

  return (
    <div>
      <div style={searchWrapperStyles}>
        <span style={searchIconStyles}>⌕</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={searchInputStyles}
        />
      </div>

      <div style={filterRowStyles}>
        {filterOptions.map(opt => {
          const isActive = filter === opt.value;
          const pillButtonStyles = {
            fontSize: 12, padding: "4px 12px", borderRadius: 20,
            cursor: "pointer",
            border: `0.5px solid ${isActive ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
            background: isActive ? "var(--color-text-primary)" : "transparent",
            color: isActive ? "var(--color-background-primary)" : "var(--color-text-secondary)",
            transition: "all 0.12s",
          };
          return (
            <button key={opt.value} onClick={() => setFilter(opt.value)} style={pillButtonStyles}>
              {opt.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={emptyStateStyles}>No tasks found</div>
      ) : (
        <div style={listWrapperStyles}>
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Task View ────────────────────────────────────────────────────────────
function AddTaskView({ onAdd }) {
  const [title, setTitle] = useState("");
  const [tag, setTag]     = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit() {
    if (!title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    onAdd({ title: title.trim(), tag });
    setTitle("");
    setTag(null);
    setError("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  // Grouped style templates
  const containerStyles = {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    padding: "20px",
  };

  const fieldGroupStyles = { marginBottom: 16 };
  const labelStyles = { fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 };
  
  const textInputStyles = {
    width: "100%", padding: "10px 12px",
    border: `0.5px solid ${error ? "#E24B4A" : "var(--color-border-tertiary)"}`,
    borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-secondary)", // Swapped out the old forced bright purple!
    color: "var(--color-text-primary)", fontSize: 14, outline: "none",
  };

  const errorTextStyles = { fontSize: 12, color: "#A32D2D", marginTop: 5 };
  const tagContainerStyles = { display: "flex", gap: 8, flexWrap: "wrap" };

  const submitButtonStyles = {
    width: "100%", padding: "11px",
    background: "var(--color-text-primary)",
    color: "var(--color-background-primary)",
    border: "none", borderRadius: "var(--border-radius-md)",
    fontSize: 14, fontWeight: 500, cursor: "pointer",
    transition: "opacity 0.12s",
  };

  const alertSuccessStyles = {
    marginTop: 12, padding: "9px 14px",
    background: "#EAF3DE", color: "#27500A",
    border: "0.5px solid #97C459",
    borderRadius: "var(--border-radius-md)",
    fontSize: 13, textAlign: "center",
  };

  return (
    <div style={containerStyles}>
      <div style={fieldGroupStyles}>
        <label style={labelStyles}>Task title</label>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={textInputStyles}
        />
        {error && <p style={errorTextStyles}>{error}</p>}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyles}>Tag <span style={{ color: "var(--color-text-tertiary)" }}>(optional)</span></label>
        <div style={tagContainerStyles}>
          {TAGS.map(t => {
            const s = TAG_STYLES[t];
            const active = tag === t;
            const tagSelectionButtonStyles = {
              fontSize: 13, padding: "5px 14px", borderRadius: 20,
              cursor: "pointer",
              background: active ? s.bg : "transparent",
              color: active ? s.color : "var(--color-text-secondary)",
              border: `0.5px solid ${active ? s.border : "var(--color-border-tertiary)"}`,
              transition: "all 0.12s",
            };
            return (
              <button key={t} onClick={() => setTag(active ? null : t)} style={tagSelectionButtonStyles}>
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={submitButtonStyles}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        + Add task
      </button>

      {success && <div style={alertSuccessStyles}>Task added successfully!</div>}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks]         = useState([]);
  const [activeTab, setActiveTab] = useState("see");

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Failed to fetch tasks:", err));
  }, []);

  const pending = tasks.filter(t => t.status !== "completed").length;
  const done    = tasks.filter(t => t.status === "completed").length;

  async function handleToggle(id) {
    const task = tasks.find(t => t.id === id);
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleStatusChange(id, status) {
    await fetch(`${API}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }

  async function handleAdd({ title, tag }) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, tag }),
    });
    const newTask = await res.json();
    setTasks(prev => [newTask, ...prev]);
  }

  const tabs = [
    { id: "see", label: "See tasks" },
    { id: "add", label: "Add task" },
  ];

  // App container styling block
  const appLayoutStyles = {
    maxWidth: 480, margin: "0 auto",
    padding: "1.5rem 1rem 2.5rem",
    fontFamily: "var(--font-sans)",
  };

  const headerMetaStyles = {
    fontSize: 11, color: "var(--color-text-tertiary)",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6,
  };

  const greetingStyles = {
    fontSize: 26, fontWeight: 500,
    color: "var(--color-text-primary)", lineHeight: 1.2,
  };

  const statsRowStyles = { display: "flex", gap: 10, marginBottom: "1.5rem" };
  const tabMenuBarStyles = {
    display: "flex", background: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-lg)", padding: 4, marginBottom: "1.25rem", gap: 4,
  };

  return (
    <div style={appLayoutStyles}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={headerMetaStyles}>{formatDate()}</div>
        <div style={greetingStyles}>{getGreeting()} 👋</div>
        <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 6 }}>
          {pending === 0 && tasks.length > 0
            ? "All done! Great work today."
            : `You have ${pending} task${pending !== 1 ? "s" : ""} remaining today.`}
        </div>
      </div>

      {/* Stats */}
      <div style={statsRowStyles}>
        {[
          { label: "Total",     value: tasks.length },
          { label: "Completed", value: done },
          { label: "Remaining", value: pending },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, background: "var(--color-background-secondary)",
            borderRadius: "var(--border-radius-md)", padding: "10px 14px",
          }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={tabMenuBarStyles}>
        {tabs.map(tab => {
          const isTabActive = activeTab === tab.id;
          const individualTabButtonStyles = {
            flex: 1, padding: "9px 0", fontSize: 14,
            fontWeight: isTabActive ? 500 : 400,
            border: "none", borderRadius: "var(--border-radius-md)",
            cursor: "pointer",
            background: isTabActive ? "var(--color-background-primary)" : "transparent",
            color: isTabActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            boxShadow: isTabActive ? "0 0 0 0.5px var(--color-border-tertiary)" : "none",
            transition: "all 0.15s",
          };
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={individualTabButtonStyles}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* View Switcher */}
      {activeTab === "see" ? (
        <SeeTasksView
          tasks={tasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <AddTaskView onAdd={handleAdd} />
      )}
    </div>
  );
}