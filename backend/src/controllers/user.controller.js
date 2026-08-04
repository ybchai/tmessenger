import { searchUsers } from "../repositories/user.repository.js";

export async function getUsers(req, res) {
  try {
    const { q } = req.query;

    const users = await searchUsers(q, req.user.id);

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
}
