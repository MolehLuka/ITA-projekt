import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { getConfig } from "../config.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const config = getConfig();

const baseSelect =
  "id, username, email, first_name as \"firstName\", last_name as \"lastName\", is_admin as \"isAdmin\", membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\", created_at as \"createdAt\"";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseMemberId = (value: string) => {
  return uuidRegex.test(value) ? value : null;
};

const ensureSelfOrAdmin = (req: { user?: { id: string; isAdmin: boolean } }, memberId: string) => {
  if (!req.user) {
    return false;
  }

  return req.user.isAdmin || req.user.id === memberId;
};

export const membersRouter = Router();

membersRouter.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body ?? {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email, and password are required" });
  }

  const existing = await pool.query(
    "select id from members where username = $1 or email = $2",
    [username, email]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(409).json({ message: "username or email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `insert into members (username, email, password_hash, first_name, last_name)
     values ($1, $2, $3, $4, $5)
     returning ${baseSelect}`,
    [username, email, passwordHash, firstName ?? null, lastName ?? null]
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { sub: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return res.status(201).json({ token, user });
});

membersRouter.post("/login", async (req, res) => {
  const { username, email, password } = req.body ?? {};

  if (!password || (!username && !email)) {
    return res.status(400).json({ message: "password and username or email are required" });
  }

  const { query, value } = username
    ? {
        query: `select ${baseSelect}, password_hash from members where username = $1`,
        value: username
      }
    : {
        query: `select ${baseSelect}, password_hash from members where email = $1`,
        value: email
      };

  const result = await pool.query(query, [value]);

  if (!result.rowCount) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const { password_hash: _passwordHash, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

membersRouter.get("/me", authenticate, async (req, res) => {
  const memberId = req.user?.id;

  if (!memberId) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const result = await pool.query(`select ${baseSelect} from members where id = $1`, [memberId]);

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json({ user: result.rows[0] });
});

membersRouter.patch("/me", authenticate, async (req, res) => {
  const memberId = req.user?.id;
  const { username, email, firstName, lastName } = req.body ?? {};

  if (!memberId) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (!username && !email && !firstName && !lastName) {
    return res.status(400).json({ message: "no fields to update" });
  }

  if (username || email) {
    const conflict = await pool.query(
      "select id from members where (username = $1 or email = $2) and id <> $3",
      [username ?? "", email ?? "", memberId]
    );

    if (conflict.rowCount && conflict.rowCount > 0) {
      return res.status(409).json({ message: "username or email already exists" });
    }
  }

  const updates: string[] = [];
  const values: Array<string | null> = [];

  if (username) {
    updates.push(`username = $${values.length + 1}`);
    values.push(username);
  }

  if (email) {
    updates.push(`email = $${values.length + 1}`);
    values.push(email);
  }

  if (firstName !== undefined) {
    updates.push(`first_name = $${values.length + 1}`);
    values.push(firstName ?? null);
  }

  if (lastName !== undefined) {
    updates.push(`last_name = $${values.length + 1}`);
    values.push(lastName ?? null);
  }

  values.push(memberId);
  const result = await pool.query(
    `update members set ${updates.join(", ")} where id = $${values.length} returning ${baseSelect}`,
    values
  );

  return res.json({ user: result.rows[0] });
});

membersRouter.post("/change-password", authenticate, async (req, res) => {
  const memberId = req.user?.id;
  const { currentPassword, newPassword } = req.body ?? {};

  if (!memberId) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "currentPassword and newPassword are required" });
  }

  const result = await pool.query(
    "select password_hash from members where id = $1",
    [memberId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

  if (!isValid) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await pool.query("update members set password_hash = $1 where id = $2", [passwordHash, memberId]);

  return res.json({ message: "password updated" });
});

membersRouter.get("/:id", authenticate, async (req, res) => {
  const memberId = parseMemberId(req.params.id);

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!ensureSelfOrAdmin(req, memberId)) {
    return res.status(403).json({ message: "forbidden" });
  }

  const result = await pool.query(`select ${baseSelect} from members where id = $1`, [memberId]);

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json({ user: result.rows[0] });
});

membersRouter.get("/:id/status", authenticate, async (req, res) => {
  const memberId = parseMemberId(req.params.id);

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!ensureSelfOrAdmin(req, memberId)) {
    return res.status(403).json({ message: "forbidden" });
  }

  const result = await pool.query(
    "select membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\" from members where id = $1",
    [memberId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json(result.rows[0]);
});

membersRouter.post("/:id/status", authenticate, requireAdmin, async (req, res) => {
  const memberId = parseMemberId(req.params.id);
  const { status, expiresAt } = req.body ?? {};

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }

  const result = await pool.query(
    "update members set membership_status = $1, membership_expires_at = $2 where id = $3 returning membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\"",
    [status, expiresAt ?? null, memberId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json(result.rows[0]);
});

membersRouter.get("/:id/membership", authenticate, async (req, res) => {
  const memberId = parseMemberId(req.params.id);

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!ensureSelfOrAdmin(req, memberId)) {
    return res.status(403).json({ message: "forbidden" });
  }

  const result = await pool.query(
    "select membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\" from members where id = $1",
    [memberId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json(result.rows[0]);
});

membersRouter.post("/:id/membership/renew", authenticate, async (req, res) => {
  const memberId = parseMemberId(req.params.id);
  const durationDays = Number(req.body?.durationDays ?? 30);

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!ensureSelfOrAdmin(req, memberId)) {
    return res.status(403).json({ message: "forbidden" });
  }

  if (!Number.isFinite(durationDays) || durationDays <= 0) {
    return res.status(400).json({ message: "durationDays must be a positive number" });
  }

  const result = await pool.query(
    "update members set membership_status = 'active', membership_expires_at = NOW() + make_interval(days => $2) where id = $1 returning membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\"",
    [memberId, Math.trunc(durationDays)]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json(result.rows[0]);
});

membersRouter.post("/:id/membership/cancel", authenticate, async (req, res) => {
  const memberId = parseMemberId(req.params.id);

  if (!memberId) {
    return res.status(400).json({ message: "invalid member id" });
  }

  if (!ensureSelfOrAdmin(req, memberId)) {
    return res.status(403).json({ message: "forbidden" });
  }

  const result = await pool.query(
    "update members set membership_status = 'inactive', membership_expires_at = NULL where id = $1 returning membership_status as \"membershipStatus\", membership_expires_at as \"membershipExpiresAt\"",
    [memberId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ message: "member not found" });
  }

  return res.json(result.rows[0]);
});
