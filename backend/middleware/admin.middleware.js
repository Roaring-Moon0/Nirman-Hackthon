export const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];

  console.log("--- Admin Auth Debug ---");
  console.log("Received Headers:", req.headers);
  console.log("Received Key:", adminKey);
  console.log("Expected Key:", process.env.ADMIN_SECRET_KEY);
  console.log("Match Status:", adminKey === process.env.ADMIN_SECRET_KEY);

  if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
    console.log("Access Denied: Keys do not match.");
    return res.status(403).json({ message: "Forbidden: Invalid admin key" });
  }
  next();
};
