import { http } from "./http.js";

export const toDosApi = {
  async listWithCount({ userId, _page = 1, _limit = 10, _sort = "id", _order = "desc", q = "", signal }) {
    const params = { userId, _page, _limit, _sort, _order };
    if (q) params.q = q; 

    const res = await http.get("/todos", {
      params,
      signal,
    });

    const total = parseInt(res.headers["x-total-count"] || "0", 10);
    return { data: res.data, total };
  },

  async create(todo) {
    const res = await http.post("/todos", todo, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  async remove(id) {
    await http.delete(`/todos/${id}`);
    return true;
  },

  async toggle(id, completed) {
    const res = await http.patch(`/todos/${id}`, { completed }, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },
};
