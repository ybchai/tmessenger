import { searchUsersByName } from "../repositories/user.repository.js";

export async function searchUsers(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        error: "Search query required",
      });
    }

    const users = await searchUsersByName(q);

    res.status(200).json(users);
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
