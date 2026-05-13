import Database from 'better-sqlite3';

const dbPath = 'database.sqlite';
const db = new Database(dbPath);

console.log('--- DB CHECK ---');
const users = db.prepare('SELECT id, email, password, role FROM users').all();
console.log(`Found ${users.length} users:`);
users.forEach(u => {
  console.log(`- ID: ${u.id}, Email: [${u.email}], Password: [${u.password}], Role: ${u.role}`);
});

const ngo = db.prepare('SELECT id, name FROM ngos').all();
console.log(`Found ${ngo.length} NGOs:`);
ngo.forEach(n => console.log(`- ID: ${n.id}, Name: ${n.name}`));
