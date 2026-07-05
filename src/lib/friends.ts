// src/lib/friends.ts — 友链 CRUD（支持 Netlify Blobs）
import { readData, writeData } from './dataStore';

const DATA_NAME = 'friends';

export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
}

/** 获取所有友链 */
export async function getAllFriends(): Promise<Friend[]> {
  return readData<Friend>(DATA_NAME);
}

/** 创建友链 */
export async function createFriend(data: Omit<Friend, 'id'>): Promise<Friend> {
  const friends = await readData<Friend>(DATA_NAME);
  const id = String(Date.now());
  const friend: Friend = { ...data, id };
  friends.push(friend);
  await writeData(DATA_NAME, friends);
  return friend;
}

/** 更新友链 */
export async function updateFriend(id: string, data: Partial<Friend>): Promise<Friend | null> {
  const friends = await readData<Friend>(DATA_NAME);
  const index = friends.findIndex((f) => f.id === id);
  if (index === -1) return null;
  friends[index] = { ...friends[index], ...data };
  await writeData(DATA_NAME, friends);
  return friends[index];
}

/** 删除友链 */
export async function deleteFriend(id: string): Promise<boolean> {
  const friends = await readData<Friend>(DATA_NAME);
  const index = friends.findIndex((f) => f.id === id);
  if (index === -1) return false;
  friends.splice(index, 1);
  await writeData(DATA_NAME, friends);
  return true;
}
