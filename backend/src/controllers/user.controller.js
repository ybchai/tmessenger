import {
  searchUsers,
  updatePreferredLanguageById,
} from "../repositories/user.repository.js";

export async function getUsers(req, res) {
  try {
    const { q = "" } = req.query;

    const users = await searchUsers(q, req.user.id);

    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      error: "Failed to fetch users",
    });
  }
}

export async function updatePreferredLanguage(req, res) {
  try {
    const { userId } = req.user.id;
    const { preferredLanguage } = req.body;

    if (!preferredLanguage) {
      return res.status(400).json({
        error: "Language required",
      });
    }

    const user = await updatePreferredLanguageById(userId, language);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update preferred language error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
}
