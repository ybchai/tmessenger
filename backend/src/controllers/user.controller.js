import { searchUsersByName, updatePreferredLanguageById } from "../repositories/user.repository.js";

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

    if(!user) {
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
