import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.sqlite');
db.pragma('foreign_keys = ON');
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'blooddost-secret-key-123';

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    ngoId TEXT,
    avatar TEXT,
    needsPasswordReset INTEGER DEFAULT 0,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS ngos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    logo TEXT,
    stamp TEXT,
    district TEXT,
    city TEXT,
    coolOffPeriodDays INTEGER DEFAULT 90,
    themeColor TEXT,
    donorLimit INTEGER DEFAULT 1000,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS donors (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    location TEXT NOT NULL, -- JSON string
    lastDonated TEXT,
    isAvailable INTEGER DEFAULT 1,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    addedByNgoId TEXT,
    donationCount INTEGER DEFAULT 0,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS blood_requests (
    id TEXT PRIMARY KEY,
    ngoId TEXT NOT NULL,
    ngoName TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    units INTEGER NOT NULL,
    urgency TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    description TEXT,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    ngoId TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    units INTEGER NOT NULL,
    expiryDate TEXT NOT NULL,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    fatherName TEXT,
    age INTEGER,
    gender TEXT,
    bloodGroup TEXT NOT NULL,
    lastTransfusion TEXT,
    cycleDays INTEGER,
    address TEXT,
    contactNumber TEXT,
    hospital TEXT,
    doctor TEXT,
    ngoId TEXT NOT NULL,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    userId TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    status TEXT NOT NULL,
    expiryDate TEXT,
    paymentProofUrl TEXT,
    submittedAt TEXT,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS donation_records (
    id TEXT PRIMARY KEY,
    donorId TEXT NOT NULL,
    ngoId TEXT NOT NULL,
    recipientName TEXT,
    recipientPhone TEXT,
    recipientAddress TEXT,
    hospitalName TEXT,
    city TEXT,
    date TEXT NOT NULL,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    audience TEXT NOT NULL,
    targetValue TEXT,
    createdAt TEXT NOT NULL,
    isPinned INTEGER DEFAULT 0,
    scheduledFor TEXT,
    authorId TEXT NOT NULL,
    isSeed INTEGER DEFAULT 0,
    createdBy TEXT
  );

  CREATE TABLE IF NOT EXISTS notification_reads (
    userId TEXT,
    notificationId TEXT,
    readAt TEXT NOT NULL,
    PRIMARY KEY (userId, notificationId)
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    type TEXT PRIMARY KEY, -- 'hospitals' or 'cities'
    data TEXT NOT NULL -- JSON string
  );
`);

// Seed default admin and mocks if not exists
const seedUsers = () => {
  // 1. Super Admin
  const admin = db.prepare('SELECT id FROM users WHERE id = ?').get('admin');
  if (!admin) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('admin', 'سپر ایڈمن (Super Admin)', 'admin@admin.com', 'admin123', 'SuperAdmin', 1, 'system');
  }

  // 2. Mock NGO
  const ngo = db.prepare('SELECT id FROM ngos WHERE id = ?').get('ngo1');
  if (!ngo) {
    db.prepare(`
      INSERT INTO ngos (id, name, address, phone, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('ngo1', 'Al-Khidmat Foundation', 'Quetta, Balochistan', '081-1234567', 1, 'system');
  }

  // 3. Mock NGO Admin
  const ngoAdmin = db.prepare('SELECT id FROM users WHERE id = ?').get('u2');
  if (!ngoAdmin) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, ngoId, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('u2', 'این جی او (NGO Admin)', 'ngo@ngo.com', 'ngo123', 'NGOAdmin', 'ngo1', 1, 'system');
  }

  // 4. Mock Donor User
  const donorUser = db.prepare('SELECT id FROM users WHERE id = ?').get('u1');
  if (!donorUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('u1', 'أحمد علی (Donor)', 'donor@donor.com', 'donor123', 'Donor', 1, 'system');
  }

  // 5. Mock Hospital
  const hospitalUser = db.prepare('SELECT id FROM users WHERE id = ?').get('h1');
  if (!hospitalUser) {
    db.prepare(`
      INSERT INTO users (id, name, email, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('h1', 'سول ہسپتال (Civil Hospital)', 'hospital@hospital.com', 'hosp123', 'Hospital', 1, 'system');
  }

  // 6. Mock Donor Profile
  const donorProfile = db.prepare('SELECT id FROM donors WHERE id = ?').get('d1');
  if (!donorProfile) {
    db.prepare(`
      INSERT INTO donors (id, userId, name, bloodGroup, location, lastDonated, isAvailable, phone, whatsapp, addedByNgoId, donationCount, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('d1', 'u1', 'Ahmed Ali', 'O+', JSON.stringify({ lat: 29.544, lng: 67.877, address: 'Model Town', city: 'Sibi', province: 'Balochistan' }), '2024-01-15', 1, '03001234567', '923001234567', 'ngo1', 0, 1, 'system');
  }
};

seedUsers();

const app = express();
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow all origins for dev, but with credentials support
    callback(null, true);
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  let token = req.cookies.token;
  
  // Fallback to Authorization header
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    console.log(`Auth failed: No token for ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(`Auth failed: Invalid token for ${req.path}`);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  console.log(`Login attempt for: ${identifier}`);
  const user = db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(identifier, identifier) as any;
  
  if (!user || (password && user.password !== password)) {
    console.log(`Login failed for: ${identifier}`);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, ngoId: user.ngoId }, JWT_SECRET, { expiresIn: '7d' });
  
  // Robust cookie for AI Studio/Iframe environments
  res.cookie('token', token, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  console.log(`Login successful for: ${identifier} (${user.role})`);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ ...userWithoutPassword, token });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none'
  });
  res.json({ success: true });
});

app.get('/api/users/me', authenticate, (req: any, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Generic Getters with Filters
app.get('/api/ngos', authenticate, (req, res) => {
  const ngos = db.prepare('SELECT * FROM ngos').all();
  res.json(ngos);
});

app.get('/api/donors', authenticate, (req: any, res) => {
  let donors;
  if (req.user.role === 'SuperAdmin') {
    donors = db.prepare('SELECT * FROM donors').all();
  } else if (req.user.role === 'NGOAdmin' || req.user.role === 'Hospital') {
    donors = db.prepare('SELECT * FROM donors WHERE addedByNgoId = ?').all(req.user.ngoId);
  } else {
    donors = db.prepare('SELECT * FROM donors WHERE userId = ?').all(req.user.id);
  }
  res.json(donors.map((d: any) => ({ ...d, location: JSON.parse(d.location) })));
});

app.patch('/api/donors/:id', authenticate, (req: any, res) => {
  const { id } = req.params;
  const updates = req.body;
  const allowed = ['name', 'bloodGroup', 'location', 'lastDonated', 'isAvailable', 'phone', 'whatsapp', 'donationCount'];
  
  const sets = [];
  const values = [];
  for (const key of Object.keys(updates)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(key === 'location' ? JSON.stringify(updates[key]) : updates[key]);
    }
  }
  
  if (sets.length === 0) return res.status(400).json({ error: 'No valid updates' });
  
  values.push(id);
  db.prepare(`UPDATE donors SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

app.get('/api/requests', authenticate, (req: any, res) => {
  let requests;
  if (req.user.role === 'SuperAdmin') {
    requests = db.prepare('SELECT * FROM blood_requests').all();
  } else {
    requests = db.prepare('SELECT * FROM blood_requests WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(requests);
});

app.get('/api/notifications', authenticate, (req: any, res) => {
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY createdAt DESC').all();
  res.json(notifications.map((n: any) => ({ ...n, isPinned: !!n.isPinned, isSeed: !!n.isSeed })));
});

app.post('/api/notifications', authenticate, (req: any, res) => {
  const n = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO notifications (id, title, message, type, audience, targetValue, createdAt, isPinned, scheduledFor, authorId, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(n.id, n.title, n.message, n.type, n.audience, n.targetValue, n.createdAt, n.isPinned ? 1 : 0, n.scheduledFor, n.authorId, 0, req.user.id);
  res.json(n);
});

app.delete('/api/notifications/:id', authenticate, (req: any, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  res.json({ success: true });
});

app.patch('/api/notifications/:id', authenticate, (req: any, res) => {
  const { id } = req.params;
  const updates = req.body;
  const allowed = ['title', 'message', 'type', 'audience', 'targetValue', 'isPinned', 'scheduledFor'];
  
  const sets = [];
  const values = [];
  for (const key of Object.keys(updates)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(key === 'isPinned' ? (updates[key] ? 1 : 0) : updates[key]);
    }
  }
  
  if (sets.length === 0) return res.status(400).json({ error: 'No valid updates' });
  
  values.push(id);
  db.prepare(`UPDATE notifications SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

app.get('/api/inventory', authenticate, (req: any, res) => {
  const ngoId = req.query.ngoId || req.user.ngoId;
  const inventory = db.prepare('SELECT * FROM inventory WHERE ngoId = ?').all(ngoId);
  res.json(inventory);
});

app.get('/api/patients', authenticate, (req: any, res) => {
  let patients;
  if (req.user.role === 'SuperAdmin') {
    patients = db.prepare('SELECT * FROM patients').all();
  } else {
    patients = db.prepare('SELECT * FROM patients WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(patients);
});

// Posters / Putters
app.post('/api/donors', authenticate, (req: any, res) => {
  const donor = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO donors (id, userId, name, bloodGroup, location, lastDonated, isAvailable, phone, whatsapp, addedByNgoId, donationCount, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(donor.id, donor.userId, donor.name, donor.bloodGroup, JSON.stringify(donor.location), donor.lastDonated, donor.isAvailable ? 1 : 0, donor.phone, donor.whatsapp, donor.addedByNgoId, donor.donationCount, 0, req.user.id);
  res.json(donor);
});

app.post('/api/ngos', authenticate, (req: any, res) => {
  const ngo = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO ngos (id, name, address, phone, logo, stamp, district, city, coolOffPeriodDays, themeColor, donorLimit, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(ngo.id, ngo.name, ngo.address, ngo.phone, ngo.logo, ngo.stamp, ngo.district, ngo.city, ngo.coolOffPeriodDays, ngo.themeColor, ngo.donorLimit, 0, req.user.id);
  res.json(ngo);
});

app.post('/api/users', authenticate, (req: any, res) => {
  const user = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, phone, password, role, ngoId, avatar, needsPasswordReset, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.name, user.email, user.phone, user.password, user.role, user.ngoId, user.avatar, user.needsPasswordReset ? 1 : 0, 0, req.user.id);
  res.json(user);
});

app.post('/api/requests', authenticate, (req: any, res) => {
  const r = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO blood_requests (id, ngoId, ngoName, bloodGroup, units, urgency, location, status, createdAt, description, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.ngoId, r.ngoName, r.bloodGroup, r.units, r.urgency, r.location, r.status, r.createdAt, r.description, 0, req.user.id);
  res.json(r);
});

app.post('/api/inventory', authenticate, (req: any, res) => {
  const item = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO inventory (id, ngoId, bloodGroup, units, expiryDate, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(item.id, item.ngoId, item.bloodGroup, item.units, item.expiryDate, 0, req.user.id);
  res.json(item);
});

app.post('/api/patients', authenticate, (req: any, res) => {
  const p = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO patients (id, name, fatherName, age, gender, bloodGroup, lastTransfusion, cycleDays, address, contactNumber, hospital, doctor, ngoId, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(p.id, p.name, p.fatherName, p.age, p.gender, p.bloodGroup, p.lastTransfusion, p.cycleDays, p.address, p.contactNumber, p.hospital, p.doctor, p.ngoId, 0, req.user.id);
  res.json(p);
});

// Suggestions
app.get('/api/suggestions', (req, res) => {
  const cities = db.prepare('SELECT data FROM suggestions WHERE type = ?').get('cities') as any;
  const hospitals = db.prepare('SELECT data FROM suggestions WHERE type = ?').get('hospitals') as any;
  res.json({
    cities: cities ? JSON.parse(cities.data) : ['Sibi', 'Quetta', 'Loralai', 'Khuzdar', 'Pishin'],
    hospitals: hospitals ? JSON.parse(hospitals.data) : ['Civil Hospital Sibi', 'Bolan Medical Complex', 'Agha Khan Hospital', 'CMH Quetta']
  });
});

app.post('/api/suggestions', authenticate, (req, res) => {
  const { type, data } = req.body;
  db.prepare('INSERT OR REPLACE INTO suggestions (type, data) VALUES (?, ?)').run(type, JSON.stringify(data));
  res.json({ success: true });
});

app.get('/api/subscriptions', authenticate, (req: any, res) => {
  let subs;
  if (req.user.role === 'SuperAdmin') {
    subs = db.prepare('SELECT * FROM subscriptions').all();
  } else {
    subs = db.prepare('SELECT * FROM subscriptions WHERE userId = ?').all(req.user.id);
  }
  res.json(subs);
});

app.post('/api/subscriptions', authenticate, (req: any, res) => {
  const sub = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO subscriptions (userId, tier, status, expiryDate, paymentProofUrl, submittedAt, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sub.userId, sub.tier, sub.status, sub.expiryDate, sub.paymentProofUrl, sub.submittedAt, 0, req.user.id);
  res.json(sub);
});

app.delete('/api/ngos/:id', authenticate, (req: any, res) => {
  if (req.user.role !== 'SuperAdmin') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  
  // Explicitly cleanup related data since SQLite foreign keys might be tricky with complex relations
  db.transaction(() => {
    db.prepare('DELETE FROM donors WHERE addedByNgoId = ?').run(id);
    db.prepare('DELETE FROM inventory WHERE ngoId = ?').run(id);
    db.prepare('DELETE FROM patients WHERE ngoId = ?').run(id);
    db.prepare('DELETE FROM blood_requests WHERE ngoId = ?').run(id);
    db.prepare('DELETE FROM users WHERE ngoId = ?').run(id);
    db.prepare('DELETE FROM ngos WHERE id = ?').run(id);
  })();
  
  res.json({ success: true });
});

// System Logo
app.get('/api/system/logo', (req, res) => {
  const logo = db.prepare('SELECT data FROM suggestions WHERE type = ?').get('system_logo') as any;
  res.json({ logo: logo ? logo.data : null });
});

app.post('/api/system/logo', authenticate, (req, res) => {
  db.prepare('INSERT OR REPLACE INTO suggestions (type, data) VALUES (?, ?)').run('system_logo', req.body.logo);
  res.json({ success: true });
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

app.get('/api/donation-records', authenticate, (req: any, res) => {
  let records;
  if (req.user.role === 'SuperAdmin') {
    records = db.prepare('SELECT * FROM donation_records').all();
  } else {
    records = db.prepare('SELECT * FROM donation_records WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(records);
});

app.post('/api/donation-records', authenticate, (req: any, res) => {
  const r = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO donation_records (id, donorId, ngoId, recipientName, recipientPhone, recipientAddress, hospitalName, city, date, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(r.id, r.donorId, r.ngoId, r.recipientName, r.recipientPhone, r.recipientAddress, r.hospitalName, r.city, r.date, 0, req.user.id);
  res.json(r);
});

app.patch('/api/users/:id', authenticate, (req: any, res) => {
  const { id } = req.params;
  const updates = req.body;
  const allowed = ['name', 'email', 'phone', 'password', 'avatar', 'needsPasswordReset'];
  
  const sets = [];
  const values = [];
  for (const key of Object.keys(updates)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(key === 'needsPasswordReset' ? (updates[key] ? 1 : 0) : updates[key]);
    }
  }
  
  if (sets.length === 0) return res.status(400).json({ error: 'No valid updates' });
  
  values.push(id);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

setupVite();

// Export for Vercel
export default app;

// Listen if not explicitly running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
