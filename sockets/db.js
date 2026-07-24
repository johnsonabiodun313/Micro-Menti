import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data.db');

const db = new sqlite3.Database(dbPath);

export function initDB(activeRooms) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS store (
        id TEXT PRIMARY KEY,
        data TEXT
      )`);

      db.get(`SELECT data FROM store WHERE id = 'activeRooms'`, (err, row) => {
        if (err) {
          console.error('[DB] Initialization error:', err);
          return resolve();
        }
        if (row && row.data) {
          try {
            const parsed = JSON.parse(row.data);
            for (const key in parsed) {
              activeRooms[key] = parsed[key];
              activeRooms[key].isChanged = true; 
            }
            console.log(`[DB] Restored ${Object.keys(parsed).length} rooms from SQLite.`);
          } catch (e) {
            console.error('[DB] Failed to parse saved state:', e);
          }
        } else {
          console.log('[DB] No previous state found, starting fresh.');
        }
        resolve();
      });
    });
  });
}

export function saveState(activeRooms) {
  const dataString = JSON.stringify(activeRooms);
  db.run(`INSERT INTO store (id, data) VALUES ('activeRooms', ?)
    ON CONFLICT(id) DO UPDATE SET data=excluded.data`, 
    [dataString], 
    (err) => {
      if (err) console.error('[DB] Failed to save state:', err);
    }
  );
}
