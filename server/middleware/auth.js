import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = data.id;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}
