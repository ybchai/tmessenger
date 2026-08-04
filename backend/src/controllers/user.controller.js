import { searchUsers } from "../repositories/user.repository.js";

export async function getUsers(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await searchUsers(q, req.auth.userId);

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
}
