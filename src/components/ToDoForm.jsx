import { useState } from "react";
import { toDosApi } from "../api/toDosApi.js";

export default function ToDoForm({ userId, handleCreated }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const charLimit = 120;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    if (title.length > charLimit) return;

    setStatus("loading");
    setError(null);

    try {
      await toDosApi.create({
        title: title.trim(),
        completed: false,
        userId
      });
      setTitle("");
      handleCreated();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        maxLength={charLimit}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo..."
        disabled={status === "loading"}
      />
      <span>
        {charLimit - title.length} chars left
      </span>
      <button
        type="submit"
        disabled={status === "loading" || !title.trim()}
      >
        {status === "loading" ? "Adding..." : "Add"}
      </button>
      {error && <div>Error: {error}</div>}
    </form>
  );
}
