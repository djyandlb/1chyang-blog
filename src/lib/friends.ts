// src/lib/friends.ts — 友链 CRUD
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve('data');
const FRIENDS_FILE = path.join(DATA_DIR, 'friends.json');

export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
}

function readFriends(): Friend[] {
  if (!fs.existsSync(FRIENDS_FILE)) return [];
  return JSON.parse(fs.readFileSync(FRIENDS_FILE, 'utf-8'));
}

function writeFriends(friends: Friend[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(FRIENDS_FILE, JSON.stringify(friends, null, 2), 'utf-8');
}

export function getAllFriends(): Friend[] {
  return readFriends();
}

export function createFriend(data: Omit<Friend, 'id'>): Friend {
  const friends = readFriends();
  const id = String(Date.now());
  const friend: Friend = { ...data, id };
  friends.push(friend);
  writeFriends(friends);
  return friend;
}

export function updateFriend(id: string, data: Partial<Friend>): Friend | null {
  const friends = readFriends();
  const index = friends.findIndex((f) => f.id === id);
  if (index === -1) return null;
  friends[index] = { ...friends[index], ...data };
  writeFriends(friends);
  return friends[index];
}

export function deleteFriend(id: string): boolean {
  const friends = readFriends();
  const index = friends.findIndex((f) => f.id === id);
  if (index === -1) return false;
  friends.splice(index, 1);
  writeFriends(friends);
  return true;
}
