import { useEffect, useState, useCallback, useRef } from "react";
import { toDosApi } from "../api/toDosApi.js";
import ToDoForm from "./ToDoForm.jsx";

export default function TodoList({ user }) {
    const [todos, setTodos] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    const [search, setSearch] = useState("");
    const searchRef = useRef(null); 
    const abortRef = useRef(null);  

    const maxPage = Math.ceil(total / limit) || 1;

    const fetchTodos = useCallback(async () => {
        if (abortRef.current) {
            abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            setStatus("loading");
            setError(null);
            const { data, total } = await toDosApi.listWithCount({
                userId: user.id,
                _page: page,
                _limit: limit,
                _sort: "id",
                _order: "desc",
                q: search,
                signal: controller.signal
            });
            setTodos(data);
            setTotal(total);
            setStatus("success");
        } catch (err) {
            if (err.name === "AbortError") return; 
            setStatus("error");
            setError(err.message);
        }
    }, [user.id, page, search]);

    useEffect(() => {
        clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            setPage(1); 
            fetchTodos();
        }, 500);

        return () => {
            clearTimeout(searchRef.current);
            if (abortRef.current) {
                abortRef.current.abort();
            }
        };
    }, [search, fetchTodos]);

    useEffect(() => {
        fetchTodos();
    }, [page, fetchTodos]);

    async function handleCreated() {
        setPage(1);
        fetchTodos();
    }

    async function handleDelete(id) {
        const ok = confirm("Delete this todo?");
        if (!ok) return;
        try {
            await toDosApi.remove(id);
            fetchTodos();
        } catch (err) {
            alert("Delete failed " + err.message);
        }
    }

    async function handleToggle(id, completed) {
        const prev = todos;
        setTodos(prev.map(t => t.id === id ? { ...t, completed } : t));
        try {
            await toDosApi.toggle(id, completed);
        } catch (err) {
            alert("Toggle failed " + err.message);
            setTodos(prev);
        }
    }

    return (
        <section>
            <ToDoForm userId={user.id} handleCreated={handleCreated} />

            <input
                type="text"
                placeholder="Search todos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />

            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span>Page {page} / {maxPage}</span>
                <button disabled={page === maxPage} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>

            {status === "loading" && <p className="status">Loading ToDos...</p>}
            {status === "error" && <p className="status">Error: {error}</p>}
            {status === "success" && todos.length === 0 && <p>No Todos Yet</p>}
            {status === "success" && todos.length > 0 && (
                <ul className="todo-list">
                    {todos.map(t => (
                        <li key={t.id} className="todo-item">
                            <label className="todo-label">
                                <input
                                    type="checkbox"
                                    checked={t.completed}
                                    onChange={(e) => handleToggle(t.id, e.target.checked)}
                                />
                                <span className={t.completed ? "completed" : ""}>
                                    {t.title}
                                </span>
                            </label>
                            <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
