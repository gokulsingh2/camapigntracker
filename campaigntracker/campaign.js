const express = require("express");
const router = express.Router();
const db = require("./db");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "fallback_dev_secret";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Create Campaign
router.post("/create", verifyToken, (req, res) => {
  const { name, source, medium, budget, status, start_date, end_date } = req.body;
  const user_id = req.userId;

  if (!name || !source || !medium || !budget)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "INSERT INTO campaigns (name, source, medium, budget, status, start_date, end_date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [name, source, medium, budget, status || "active", start_date || null, end_date || null, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: result.insertId });
    }
  );
});

// Get All Campaigns
router.get("/all", verifyToken, (req, res) => {
  const user_id = req.userId;
  db.query(
    "SELECT * FROM campaigns WHERE user_id = ? ORDER BY id DESC",
    [user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// Edit Campaign
router.put("/edit/:id", verifyToken, (req, res) => {
  const { name, source, medium, budget, status, start_date, end_date } = req.body;
  const campaign_id = req.params.id;
  const user_id = req.userId;

  if (!name || !source || !medium || !budget)
    return res.status(400).json({ message: "All fields are required" });

  db.query(
    "UPDATE campaigns SET name=?, source=?, medium=?, budget=?, status=?, start_date=?, end_date=? WHERE id=? AND user_id=?",
    [name, source, medium, budget, status || "active", start_date || null, end_date || null, campaign_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Campaign not found" });
      res.json({ message: "Campaign updated" });
    }
  );
});

// Delete Campaign
router.delete("/delete/:id", verifyToken, (req, res) => {
  const campaign_id = req.params.id;
  const user_id = req.userId;

  db.query(
    "DELETE FROM campaigns WHERE id = ? AND user_id = ?",
    [campaign_id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Campaign deleted" });
    }
  );
});

module.exports = router;