export async function checkAuth(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth:", error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
