import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { resolvePath } from './pathHelper';

const DATA_DIR = resolvePath('data');

// 初始化本地 SQLite (LibSQL) 客户端
const client = createClient({
  url: `file:${path.join(DATA_DIR, 'archive.db')}`
});

let dbInitialized = false;

// 确保数据库和数据表存在
async function ensureDb() {
  if (dbInitialized) return;

  try {
    // 确保数据目录存在
    await fs.mkdir(DATA_DIR, { recursive: true });

    // 建立 suggestions (请愿墙) 数据表
    await client.execute(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        time TEXT NOT NULL UNIQUE
      )
    `);

    // 建立 visitor_stats (访客计数) 数据表
    await client.execute(`
      CREATE TABLE IF NOT EXISTS visitor_stats (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      )
    `);

    // 初始化默认计数值
    await client.execute({
      sql: `INSERT OR IGNORE INTO visitor_stats (key, count) VALUES ('total_count', 0)`,
      args: []
    });

    dbInitialized = true;
  } catch (err) {
    console.error('Failed to initialize SQLite database:', err);
    throw err;
  }
}

// 1. 获取访客计数
export async function getVisitorCount(): Promise<number> {
  try {
    await ensureDb();
    const res = await client.execute({
      sql: `SELECT count FROM visitor_stats WHERE key = 'total_count'`,
      args: []
    });
    if (res.rows.length > 0) {
      return Number(res.rows[0].count);
    }
    return 0;
  } catch (err) {
    console.error('Failed to get visitor count:', err);
    return 0;
  }
}

// 2. 递增访客计数
export async function incrementVisitorCount(): Promise<number> {
  try {
    await ensureDb();
    // 使用 SQL 保证高并发计数原子性更新
    await client.execute({
      sql: `UPDATE visitor_stats SET count = count + 1 WHERE key = 'total_count'`,
      args: []
    });
    return await getVisitorCount();
  } catch (err) {
    console.error('Failed to increment visitor count:', err);
    return 1;
  }
}

export interface Suggestion {
  name: string;
  time: string;
}

// 3. 获取请愿列表 (最多保留 200 条最新纪录)
export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    await ensureDb();
    const res = await client.execute({
      sql: `SELECT name, time FROM suggestions ORDER BY time DESC LIMIT 200`,
      args: []
    });
    return res.rows.map(row => ({
      name: String(row.name),
      time: String(row.time)
    }));
  } catch (err) {
    console.error('Failed to get suggestions:', err);
    return [];
  }
}

// 4. 添加一条请愿 (自动限制在 200 条以内)
export async function addSuggestion(name: string): Promise<boolean> {
  try {
    await ensureDb();
    const time = new Date().toISOString();
    await client.execute({
      sql: `INSERT INTO suggestions (name, time) VALUES (?, ?)`,
      args: [name, time]
    });

    // 自动清理超过 200 条的历史建议记录
    const list = await getSuggestions();
    if (list.length > 200) {
      const thresholdTime = list[199].time;
      await client.execute({
        sql: `DELETE FROM suggestions WHERE time < ?`,
        args: [thresholdTime]
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to add suggestion:', err);
    return false;
  }
}

// 5. 删除一条请愿
export async function deleteSuggestion(time: string): Promise<boolean> {
  try {
    await ensureDb();
    await client.execute({
      sql: `DELETE FROM suggestions WHERE time = ?`,
      args: [time]
    });
    return true;
  } catch (err) {
    console.error('Failed to delete suggestion:', err);
    return false;
  }
}
