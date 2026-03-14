import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { getConfig } from "../config.js";

const config = getConfig();

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
    "insert into members (username, email, password_hash, first_name, last_name) values ($1, $2, $3, $4, $5) returning id, username, email, first_name as \"firstName\", last_name as \"lastName\", created_at as \"createdAt\"",
    [username, email, passwordHash, firstName ?? null, lastName ?? null]
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { sub: user.id, username: user.username, email: user.email },
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
    ? { query: "select id, username, email, password_hash, first_name as \"firstName\", last_name as \"lastName\", created_at as \"createdAt\" from members where username = $1", value: username }
    : { query: "select id, username, email, password_hash, first_name as \"firstName\", last_name as \"lastName\", created_at as \"createdAt\" from members where email = $1", value: email };

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
    { sub: user.id, username: user.username, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const { password_hash: _passwordHash, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});
