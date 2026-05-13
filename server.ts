import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
// import Database from 'better-sqlite3'; // Dynamically imported below for Vercel compatibility
import postgres from 'postgres';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const dbPath = (() => {
  // In Vercel or many containerized environments, /tmp is the only writable spot
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return '/tmp/database.sqlite';
  }
  return 'database.sqlite';
})();

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const isPostgres = !!POSTGRES_URL;

let db: any;

async function setupDatabase() {
  if (isPostgres) {
    console.log('🚀 Using PostgreSQL (Supabase) for data persistence');
    const sql = postgres(POSTGRES_URL!, { 
      ssl: 'require',
      connect_timeout: 10,
      idle_timeout: 20,
      max: 10
    });
    
    // Test connection
    try {
      await sql`SELECT 1`;
      console.log('✅ Postgres connection established');
    } catch (err) {
      console.error('❌ Postgres connection failed. Check your POSTGRES_URL:', err instanceof Error ? err.message : String(err));
    }
    
    // Helper to map database columns (snake_case or lowercase) back to camelCase for the application
    const mapKeys = (obj: any): any => {
      if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
      if (Array.isArray(obj)) return obj.map(mapKeys);
      
      const newObj: any = {};
      const mappings: Record<string, string> = {
        ngoid: 'ngoId',
        ngo_id: 'ngoId',
        needspasswordreset: 'needsPasswordReset',
        needs_password_reset: 'needsPasswordReset',
        isseed: 'isSeed',
        is_seed: 'isSeed',
        createdby: 'createdBy',
        created_by: 'createdBy',
        addedbyngoid: 'addedByNgoId',
        added_by_ngo_id: 'addedByNgoId',
        donationcount: 'donationCount',
        donation_count: 'donationCount',
        ngoname: 'ngoName',
        ngo_name: 'ngoName',
        bloodgroup: 'bloodGroup',
        blood_group: 'bloodGroup',
        createdat: 'createdAt',
        created_at: 'createdAt',
        expirydate: 'expiryDate',
        expiry_date: 'expiryDate',
        fathername: 'fatherName',
        father_name: 'fatherName',
        lasttransfusion: 'lastTransfusion',
        last_transfusion: 'lastTransfusion',
        cycledays: 'cycleDays',
        cycle_days: 'cycleDays',
        contactnumber: 'contactNumber',
        contact_number: 'contactNumber',
        hospitalname: 'hospitalName',
        hospital_name: 'hospitalName',
        paymentproofurl: 'paymentProofUrl',
        payment_proof_url: 'paymentProofUrl',
        submittedat: 'submittedAt',
        submitted_at: 'submittedAt',
        targetvalue: 'targetValue',
        target_value: 'targetValue',
        scheduledfor: 'scheduledFor',
        scheduled_for: 'scheduledFor',
        authorid: 'authorId',
        author_id: 'authorId',
        notificationid: 'notificationId',
        notification_id: 'notificationId',
        readat: 'readAt',
        read_at: 'readAt',
        cooloffperioddays: 'coolOffPeriodDays',
        cool_off_period_days: 'coolOffPeriodDays',
        themecolor: 'themeColor',
        theme_color: 'themeColor',
        donorlimit: 'donorLimit',
        donor_limit: 'donorLimit',
        userid: 'userId',
        user_id: 'userId',
        lastdonated: 'lastDonated',
        last_donated: 'lastDonated',
        isavailable: 'isAvailable',
        is_available: 'isAvailable',
        donorid: 'donorId',
        donor_id: 'donorId',
        recipientname: 'recipientName',
        recipient_name: 'recipientName',
        recipientphone: 'recipientPhone',
        recipient_phone: 'recipientPhone',
        recipientaddress: 'recipientAddress',
        recipient_address: 'recipientAddress'
      };

      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        const mappedKey = mappings[lowerKey] || key;
        newObj[mappedKey] = obj[key];
      }
      return newObj;
    };

    const convertParams = (text: string) => {
      let i = 1;
      return text.replace(/\?/g, () => `$${i++}`);
    };

    const cleanParams = (params: any[]) => params.map(p => p === undefined ? null : p);

    db = {
      exec: async (text: string) => {
        try {
          return await sql.unsafe(text.replace(/COLLATE NOCASE/g, ''));
        } catch (err) {
          console.error('❌ Postgres exec error:', err);
          throw err;
        }
      },
      prepare: (text: string) => {
        const pgText = convertParams(text);
        return {
          run: async (...params: any[]) => {
            try {
              const res = await sql.unsafe(pgText, cleanParams(params));
              return {
                changes: res.count,
                lastInsertRowid: res[0]?.id
              };
            } catch (err) {
              console.error(`❌ Postgres run error [${text}]:`, err);
              throw err;
            }
          },
          all: async (...params: any[]) => {
            try {
              const rows = await sql.unsafe(pgText, cleanParams(params));
              return mapKeys(rows);
            } catch (err) {
              console.error(`❌ Postgres all error [${text}]:`, err);
              throw err;
            }
          },
          get: async (...params: any[]) => {
            try {
              const rows = await sql.unsafe(pgText, cleanParams(params));
              return mapKeys(rows[0]);
            } catch (err) {
              console.error(`❌ Postgres get error [${text}]:`, err);
              throw err;
            }
          }
        };
      },
      transaction: async (fn: any) => await sql.begin(fn)
    };
  } else {
    console.log(`🏠 Using local SQLite at: ${dbPath}`);
    const { default: Database } = await import('better-sqlite3');
    const sqlite = new Database(dbPath);
    sqlite.pragma('foreign_keys = ON');

    const mapKeys = (obj: any): any => {
      if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
      if (Array.isArray(obj)) return obj.map(mapKeys);
      
      const newObj: any = {};
      const mappings: Record<string, string> = {
        ngoid: 'ngoId',
        ngo_id: 'ngoId',
        needspasswordreset: 'needsPasswordReset',
        needs_password_reset: 'needsPasswordReset',
        isseed: 'isSeed',
        is_seed: 'isSeed',
        createdby: 'createdBy',
        created_by: 'createdBy',
        addedbyngoid: 'addedByNgoId',
        added_by_ngo_id: 'addedByNgoId',
        donationcount: 'donationCount',
        donation_count: 'donationCount',
        ngoname: 'ngoName',
        ngo_name: 'ngoName',
        bloodgroup: 'bloodGroup',
        blood_group: 'bloodGroup',
        createdat: 'createdAt',
        created_at: 'createdAt',
        expirydate: 'expiryDate',
        expiry_date: 'expiryDate',
        fathername: 'fatherName',
        father_name: 'fatherName',
        lasttransfusion: 'lastTransfusion',
        last_transfusion: 'lastTransfusion',
        cycledays: 'cycleDays',
        cycle_days: 'cycleDays',
        contactnumber: 'contactNumber',
        contact_number: 'contactNumber',
        hospitalname: 'hospitalName',
        hospital_name: 'hospitalName',
        paymentproofurl: 'paymentProofUrl',
        payment_proof_url: 'paymentProofUrl',
        submittedat: 'submittedAt',
        submitted_at: 'submittedAt',
        targetvalue: 'targetValue',
        target_value: 'targetValue',
        scheduledfor: 'scheduledFor',
        scheduled_for: 'scheduledFor',
        authorid: 'authorId',
        author_id: 'authorId',
        notificationid: 'notificationId',
        notification_id: 'notificationId',
        readat: 'readAt',
        read_at: 'readAt',
        cooloffperioddays: 'coolOffPeriodDays',
        cool_off_period_days: 'coolOffPeriodDays',
        themecolor: 'themeColor',
        theme_color: 'themeColor',
        donorlimit: 'donorLimit',
        donor_limit: 'donorLimit',
        userid: 'userId',
        user_id: 'userId',
        lastdonated: 'lastDonated',
        last_donated: 'lastDonated',
        isavailable: 'isAvailable',
        is_available: 'isAvailable',
        donorid: 'donorId',
        donor_id: 'donorId',
        recipientname: 'recipientName',
        recipient_name: 'recipientName',
        recipientphone: 'recipientPhone',
        recipient_phone: 'recipientPhone',
        recipientaddress: 'recipientAddress',
        recipient_address: 'recipientAddress'
      };

      for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase();
        const mappedKey = mappings[lowerKey] || key;
        newObj[mappedKey] = obj[key];
      }
      return newObj;
    };

    db = {
      exec: (text: string) => sqlite.exec(text),
      prepare: (text: string) => {
        const stmt = sqlite.prepare(text);
        return {
          run: (...params: any[]) => stmt.run(...params),
          all: (...params: any[]) => mapKeys(stmt.all(...params)),
          get: (...params: any[]) => mapKeys(stmt.get(...params))
        };
      },
      transaction: (fn: any) => sqlite.transaction(fn)()
    };
  }
}

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'blooddost-secret-key-123';

// Initialize Database Tables
const initDb = async () => {
  await db.exec(`
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
};

// Seed default admin and mocks if not exists
const seedUsers = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // 1. Super Admin
    await db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET password=excluded.password, email=excluded.email, phone=excluded.phone, role=excluded.role
    `).run('admin', 'سپر ایڈمن (Super Admin)', 'admin@admin.com', '03450000000', 'admin123', 'SuperAdmin', 1, 'system');
    console.log('✅ Admin user synced');

    // 2. Mock NGO
    await db.prepare(`
      INSERT INTO ngos (id, name, address, phone, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).run('ngo1', 'Al-Khidmat Foundation', 'Quetta, Balochistan', '081-1234567', 1, 'system');

    // 3. Mock NGO Admin
    await db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, ngoId, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET password=excluded.password, email=excluded.email, phone=excluded.phone, role=excluded.role, ngoId=excluded.ngoId
    `).run('u2', 'این جی او (NGO Admin)', 'ngo@ngo.com', '03451111111', 'ngo123', 'NGOAdmin', 'ngo1', 1, 'system');
    console.log('✅ NGO Admin synced');

    // 4. Mock Donor User
    await db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET password=excluded.password, email=excluded.email, phone=excluded.phone, role=excluded.role
    `).run('u1', 'أحمد علی (Donor)', 'donor@donor.com', '03001234567', 'donor123', 'Donor', 1, 'system');
    console.log('✅ Donor user synced');

    // 5. Mock Hospital
    await db.prepare(`
      INSERT INTO users (id, name, email, phone, password, role, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET password=excluded.password, email=excluded.email, phone=excluded.phone, role=excluded.role
    `).run('h1', 'سول ہسپتال (Civil Hospital)', 'hospital@hospital.com', '03452222222', 'hosp123', 'Hospital', 1, 'system');
    console.log('✅ Hospital user synced');

    // 6. Mock Donor Profile
    await db.prepare(`
      INSERT INTO donors (id, userId, name, bloodGroup, location, lastDonated, isAvailable, phone, whatsapp, addedByNgoId, donationCount, isSeed, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `).run('d1', 'u1', 'Ahmed Ali', 'O+', JSON.stringify({ lat: 29.544, lng: 67.877, address: 'Model Town', city: 'Sibi', province: 'Balochistan' }), '2024-01-15', 1, '03001234567', '923001234567', 'ngo1', 0, 1, 'system');

    const userCountResult = await db.prepare('SELECT COUNT(*) as count FROM users').get();
    const userCount = userCountResult?.count || 0;
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Log available emails for verification
    const users = await db.prepare('SELECT email, role, password FROM users').all();
    console.log('👥 Available users for login:');
    users.forEach((u: any) => console.log(` - ${u.email} (${u.role}) [Pass: ${u.password}]`));

  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
};


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
  // Allow anonymous registration for these specific paths
  const publicPostPaths = ['/api/auth/login', '/api/users', '/api/ngos', '/api/donors'];
  if (req.method === 'POST' && publicPostPaths.includes(req.path)) {
    // Basic protection: if trying to create an admin role anonymously, block it
    if (req.path === '/api/users' && req.body.role === 'SuperAdmin') {
      return res.status(401).json({ error: 'Unauthorized role assignment' });
    }
    return next();
  }

  let token = null;

  // Prefer Authorization header as it's explicitly set by current session
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  
  // Fallback to cookie
  if (!token) {
    token = req.cookies.token;
  }

  if (!token) {
    console.log(`Auth failed: No token found in header or cookie for ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err: any) {
    console.log(`Auth failed: Token verification failed for ${req.path}. Error: ${err.message}`);
    // If it's a cookie failure, we should probably tell the client to clear it, 
    // but for now 401 is standard.
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

app.get("/api/health", async (req, res) => {
  try {
    const userCountResult = await db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const admin = await db.prepare('SELECT email, role FROM users WHERE role = ?').get('SuperAdmin') as any;
    const allEmails = await db.prepare('SELECT email, role FROM users').all() as any[];
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      dbPath, 
      userCount: userCountResult?.count || 0,
      adminExists: !!admin,
      adminEmail: admin?.email,
      env: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      isPostgres,
      debug_users: allEmails.map(u => `${u.email} (${u.role})`)
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err instanceof Error ? err.message : String(err) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log(`[AUTH] Login attempt for: [${identifier}]`);
    
    if (!identifier) {
      return res.status(400).json({ error: 'Identifier is required' });
    }

    const cleanIdentifier = String(identifier).trim();

    // Postgres is case-sensitive by default, SQLite LOWER handles it.
    const user = await db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?').get(cleanIdentifier, cleanIdentifier) as any;
    
    if (!user) {
      console.log(`[AUTH] Login failed: User NOT found in database for identifier [${cleanIdentifier}]`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[AUTH] User found: ${user.email} (ID: ${user.id}, Role: ${user.role})`);

    // Strict password check
    if (String(user.password).trim() !== String(password).trim()) {
      console.log(`[AUTH] Login failed: Password mismatch for user [${user.email}]`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, ngoId: user.ngoId }, JWT_SECRET, { expiresIn: '7d' });
    
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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'none'
  });
  res.json({ success: true });
});

app.get('/api/users/me', authenticate, async (req: any, res) => {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Generic Getters with Filters
app.get('/api/ngos', authenticate, async (req, res) => {
  const ngos = await db.prepare('SELECT * FROM ngos').all();
  res.json(ngos);
});

app.get('/api/donors', authenticate, async (req: any, res) => {
  let donors;
  if (req.user.role === 'SuperAdmin') {
    donors = await db.prepare('SELECT * FROM donors').all();
  } else if (req.user.role === 'NGOAdmin' || req.user.role === 'Hospital') {
    donors = await db.prepare('SELECT * FROM donors WHERE addedByNgoId = ?').all(req.user.ngoId);
  } else {
    donors = await db.prepare('SELECT * FROM donors WHERE userId = ?').all(req.user.id);
  }
  res.json(donors.map((d: any) => ({ ...d, location: JSON.parse(d.location) })));
});

app.patch('/api/donors/:id', authenticate, async (req: any, res) => {
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
  await db.prepare(`UPDATE donors SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

app.get('/api/requests', authenticate, async (req: any, res) => {
  let requests;
  if (req.user.role === 'SuperAdmin') {
    requests = await db.prepare('SELECT * FROM blood_requests').all();
  } else {
    requests = await db.prepare('SELECT * FROM blood_requests WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(requests);
});

app.get('/api/notifications', authenticate, async (req: any, res) => {
  const notifications = await db.prepare('SELECT * FROM notifications ORDER BY createdAt DESC').all();
  res.json(notifications.map((n: any) => ({ ...n, isPinned: !!n.isPinned, isSeed: !!n.isSeed })));
});

app.post('/api/notifications', authenticate, async (req: any, res) => {
  const n = req.body;
  await db.prepare(`
    INSERT INTO notifications (id, title, message, type, audience, targetValue, createdAt, isPinned, scheduledFor, authorId, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET title=excluded.title, message=excluded.message, type=excluded.type, audience=excluded.audience, targetValue=excluded.targetValue, createdAt=excluded.createdAt, isPinned=excluded.isPinned, scheduledFor=excluded.scheduledFor, authorId=excluded.authorId
  `).run(n.id, n.title, n.message, n.type, n.audience, n.targetValue, n.createdAt, n.isPinned ? 1 : 0, n.scheduledFor, n.authorId, 0, req.user.id);
  res.json(n);
});

app.delete('/api/notifications/:id', authenticate, async (req: any, res) => {
  const { id } = req.params;
  await db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  res.json({ success: true });
});

app.patch('/api/notifications/:id', authenticate, async (req: any, res) => {
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
  await db.prepare(`UPDATE notifications SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  res.json({ success: true });
});

app.get('/api/inventory', authenticate, async (req: any, res) => {
  const ngoId = req.query.ngoId || req.user.ngoId;
  const inventory = await db.prepare('SELECT * FROM inventory WHERE ngoId = ?').all(ngoId);
  res.json(inventory);
});

app.get('/api/patients', authenticate, async (req: any, res) => {
  let patients;
  if (req.user.role === 'SuperAdmin') {
    patients = await db.prepare('SELECT * FROM patients').all();
  } else {
    patients = await db.prepare('SELECT * FROM patients WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(patients);
});

// Posters / Putters
app.post('/api/donors', authenticate, async (req: any, res) => {
  const donor = req.body;
  await db.prepare(`
    INSERT INTO donors (id, userId, name, bloodGroup, location, lastDonated, isAvailable, phone, whatsapp, addedByNgoId, donationCount, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, bloodGroup=excluded.bloodGroup, location=excluded.location, lastDonated=excluded.lastDonated, isAvailable=excluded.isAvailable, phone=excluded.phone, whatsapp=excluded.whatsapp, donationCount=excluded.donationCount
  `).run(donor.id, donor.userId, donor.name, donor.bloodGroup, JSON.stringify(donor.location), donor.lastDonated, donor.isAvailable ? 1 : 0, donor.phone, donor.whatsapp, donor.addedByNgoId, donor.donationCount, 0, req.user.id);
  res.json(donor);
});

app.post('/api/ngos', authenticate, async (req: any, res) => {
  const ngo = req.body;
  await db.prepare(`
    INSERT INTO ngos (id, name, address, phone, logo, stamp, district, city, coolOffPeriodDays, themeColor, donorLimit, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, address=excluded.address, phone=excluded.phone, logo=excluded.logo, stamp=excluded.stamp, district=excluded.district, city=excluded.city, coolOffPeriodDays=excluded.coolOffPeriodDays, themeColor=excluded.themeColor, donorLimit=excluded.donorLimit
  `).run(ngo.id, ngo.name, ngo.address, ngo.phone, ngo.logo, ngo.stamp, ngo.district, ngo.city, ngo.coolOffPeriodDays, ngo.themeColor, ngo.donorLimit, 0, req.user.id);
  res.json(ngo);
});

app.post('/api/users', authenticate, async (req: any, res) => {
  const user = req.body;
  await db.prepare(`
    INSERT INTO users (id, name, email, phone, password, role, ngoId, avatar, needsPasswordReset, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, phone=excluded.phone, password=excluded.password, role=excluded.role, ngoId=excluded.ngoId, avatar=excluded.avatar, needsPasswordReset=excluded.needsPasswordReset
  `).run(user.id, user.name, user.email, user.phone, user.password, user.role, user.ngoId, user.avatar, user.needsPasswordReset ? 1 : 0, 0, req.user.id);
  res.json(user);
});

app.post('/api/requests', authenticate, async (req: any, res) => {
  const r = req.body;
  await db.prepare(`
    INSERT INTO blood_requests (id, ngoId, ngoName, bloodGroup, units, urgency, location, status, createdAt, description, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET ngoId=excluded.ngoId, ngoName=excluded.ngoName, bloodGroup=excluded.bloodGroup, units=excluded.units, urgency=excluded.urgency, location=excluded.location, status=excluded.status, createdAt=excluded.createdAt, description=excluded.description
  `).run(r.id, r.ngoId, r.ngoName, r.bloodGroup, r.units, r.urgency, r.location, r.status, r.createdAt, r.description, 0, req.user.id);
  res.json(r);
});

app.post('/api/inventory', authenticate, async (req: any, res) => {
  const item = req.body;
  await db.prepare(`
    INSERT INTO inventory (id, ngoId, bloodGroup, units, expiryDate, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET ngoId=excluded.ngoId, bloodGroup=excluded.bloodGroup, units=excluded.units, expiryDate=excluded.expiryDate
  `).run(item.id, item.ngoId, item.bloodGroup, item.units, item.expiryDate, 0, req.user.id);
  res.json(item);
});

app.post('/api/patients', authenticate, async (req: any, res) => {
  const p = req.body;
  await db.prepare(`
    INSERT INTO patients (id, name, fatherName, age, gender, bloodGroup, lastTransfusion, cycleDays, address, contactNumber, hospital, doctor, ngoId, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, fatherName=excluded.fatherName, age=excluded.age, gender=excluded.gender, bloodGroup=excluded.bloodGroup, lastTransfusion=excluded.lastTransfusion, cycleDays=excluded.cycleDays, address=excluded.address, contactNumber=excluded.contactNumber, hospital=excluded.hospital, doctor=excluded.doctor
  `).run(p.id, p.name, p.fatherName, p.age, p.gender, p.bloodGroup, p.lastTransfusion, p.cycleDays, p.address, p.contactNumber, p.hospital, p.doctor, p.ngoId, 0, req.user.id);
  res.json(p);
});

// Suggestions
app.get('/api/suggestions', async (req, res) => {
  const cities = await db.prepare('SELECT data FROM suggestions WHERE type = ?').get('cities') as any;
  const hospitals = await db.prepare('SELECT data FROM suggestions WHERE type = ?').get('hospitals') as any;
  res.json({
    cities: cities ? JSON.parse(cities.data) : ['Sibi', 'Quetta', 'Loralai', 'Khuzdar', 'Pishin'],
    hospitals: hospitals ? JSON.parse(hospitals.data) : ['Civil Hospital Sibi', 'Bolan Medical Complex', 'Agha Khan Hospital', 'CMH Quetta']
  });
});

app.post('/api/suggestions', authenticate, async (req, res) => {
  const { type, data } = req.body;
  await db.prepare(`
    INSERT INTO suggestions (type, data) VALUES (?, ?)
    ON CONFLICT(type) DO UPDATE SET data=excluded.data
  `).run(type, JSON.stringify(data));
  res.json({ success: true });
});

app.get('/api/subscriptions', authenticate, async (req: any, res) => {
  let subs;
  if (req.user.role === 'SuperAdmin') {
    subs = await db.prepare('SELECT * FROM subscriptions').all();
  } else {
    subs = await db.prepare('SELECT * FROM subscriptions WHERE userId = ?').all(req.user.id);
  }
  res.json(subs);
});

app.post('/api/subscriptions', authenticate, async (req: any, res) => {
  const sub = req.body;
  await db.prepare(`
    INSERT INTO subscriptions (userId, tier, status, expiryDate, paymentProofUrl, submittedAt, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET tier=excluded.tier, status=excluded.status, expiryDate=excluded.expiryDate, paymentProofUrl=excluded.paymentProofUrl, submittedAt=excluded.submittedAt
  `).run(sub.userId, sub.tier, sub.status, sub.expiryDate, sub.paymentProofUrl, sub.submittedAt, 0, req.user.id);
  res.json(sub);
});

app.delete('/api/ngos/:id', authenticate, async (req: any, res) => {
  if (req.user.role !== 'SuperAdmin') return res.status(403).json({ error: 'Forbidden' });
  const { id } = req.params;
  
  await db.transaction(async (trx: any) => {
    // Note: Transaction handles differently in postgres vs sqlite wrapper, but this is a safe common path
    await db.prepare('DELETE FROM donors WHERE addedByNgoId = ?').run(id);
    await db.prepare('DELETE FROM inventory WHERE ngoId = ?').run(id);
    await db.prepare('DELETE FROM patients WHERE ngoId = ?').run(id);
    await db.prepare('DELETE FROM blood_requests WHERE ngoId = ?').run(id);
    await db.prepare('DELETE FROM users WHERE ngoId = ?').run(id);
    await db.prepare('DELETE FROM ngos WHERE id = ?').run(id);
  });
  
  res.json({ success: true });
});

// System Logo
app.get('/api/system/logo', async (req, res) => {
  const logo = await db.prepare('SELECT data FROM suggestions WHERE type = ?').get('system_logo') as any;
  res.json({ logo: logo ? logo.data : null });
});

app.post('/api/system/logo', authenticate, async (req, res) => {
  await db.prepare(`
    INSERT INTO suggestions (type, data) VALUES (?, ?)
    ON CONFLICT(type) DO UPDATE SET data=excluded.data
  `).run('system_logo', req.body.logo);
  res.json({ success: true });
});

// --- API Routes Continued ---

app.get('/api/donation-records', authenticate, async (req: any, res) => {
  let records;
  if (req.user.role === 'SuperAdmin') {
    records = await db.prepare('SELECT * FROM donation_records').all();
  } else {
    records = await db.prepare('SELECT * FROM donation_records WHERE ngoId = ?').all(req.user.ngoId);
  }
  res.json(records);
});

app.post('/api/donation-records', authenticate, async (req: any, res) => {
  const r = req.body;
  await db.prepare(`
    INSERT INTO donation_records (id, donorId, ngoId, recipientName, recipientPhone, recipientAddress, hospitalName, city, date, isSeed, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET donorId=excluded.donorId, ngoId=excluded.ngoId, recipientName=excluded.recipientName, recipientPhone=excluded.recipientPhone, recipientAddress=excluded.recipientAddress, hospitalName=excluded.hospitalName, city=excluded.city, date=excluded.date
  `).run(r.id, r.donorId, r.ngoId, r.recipientName, r.recipientPhone, r.recipientAddress, r.hospitalName, r.city, r.date, 0, req.user.id);
  res.json(r);
});

app.patch('/api/users/:id', authenticate, async (req: any, res) => {
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
  await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...values);
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

async function startServer() {
  await setupDatabase();
  await initDb();
  await seedUsers();
  await setupVite();
  
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

// Export for Vercel
export default app;
