import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.resolve('data');

export async function getVisitorCount(): Promise<number> {
  const file = path.join(DATA_DIR, 'visitor_count.json');
  try {
    const data = await fs.readFile(file, 'utf-8');
    const parsed = JSON.parse(data);
    return typeof parsed.count === 'number' ? parsed.count : 0;
  } catch {
    return 0;
  }
}

export async function incrementVisitorCount(): Promise<number> {
  const file = path.join(DATA_DIR, 'visitor_count.json');
  try {
    let count = await getVisitorCount();
    count += 1;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify({ count }), 'utf-8');
    return count;
  } catch {
    return 1;
  }
}

export interface Suggestion {
  name: string;
  time: string;
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const file = path.join(DATA_DIR, 'suggestions.json');
  try {
    const data = await fs.readFile(file, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
  } catch {
    return [];
  }
}

export async function addSuggestion(name: string): Promise<boolean> {
  const file = path.join(DATA_DIR, 'suggestions.json');
  try {
    const suggestions = await getSuggestions();
    suggestions.unshift({
      name,
      time: new Date().toISOString()
    });
    if (suggestions.length > 200) {
      suggestions.length = 200;
    }
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify({ suggestions }), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function deleteSuggestion(time: string): Promise<boolean> {
  const file = path.join(DATA_DIR, 'suggestions.json');
  try {
    const suggestions = await getSuggestions();
    const updated = suggestions.filter(s => s.time !== time);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify({ suggestions: updated }), 'utf-8');
    return true;
  } catch {
    return false;
  }
}
