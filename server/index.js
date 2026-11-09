const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_glowup_uth_2026";
const DB_NAME = process.env.DB_NAME || "glowup_db";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Comprobar conexión a MySQL apenas inicie el servidor
pool.getConnection()
  .then((conn) => {
    console.log("✅ Conectado exitosamente a MySQL en AMP -> Base de datos:", DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Error conectando a MySQL:", err.message);
  });

// Ruta de verificación en http://localhost:3001/
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "API de GlowUp conectada a MySQL correctamente 🚀" });
});

// Ruta de Login actualizada para aceptar usuario (handle) o correo (email)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Busca en la base de datos si coincide con el handle o con el email
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE handle = ? OR email = ?",
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign({ id: user.id, handle: user.handle }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        handle: user.handle,
        avatar: user.avatar || undefined,
        initials: user.initials,
        tone: user.tone,
        followers: user.followers,
        bio: user.bio || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta de Registro
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, handle, email, password } = req.body;
    if (!name || !handle || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR handle = ?",
      [email, handle]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "El correo o usuario (@handle) ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = "u_" + Date.now();
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const bio = "Explorando nuevas ideas en GlowUp.";
    const tone = "coral";

    await pool.query(
      `INSERT INTO users (id, name, handle, email, password_hash, initials, tone, followers, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [id, name, handle, email, password_hash, initials, tone, bio]
    );

    const token = jwt.sign({ id, handle }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id, name, handle, initials, tone, followers: 0, bio },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Backend corriendo en http://localhost:${PORT}`);
});