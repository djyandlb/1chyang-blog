// src/lib/settings.ts — 站点设置 CRUD
import fs from 'node:fs';
import path from 'node:path';

const SETTINGS_FILE = path.resolve('data/settings.json');

export interface SiteSettings {
  about: string;
  subtitle: string;
}

function defaultSettings(): SiteSettings {
  return {
    about: '你好，我是 **一步穿杨**。\n\n百步之外，箭不虚发 —— 这是我对自己技术和创造力的期许。\n\n欢迎通过 GitHub 或邮件联系我。',
    subtitle: '记录思考、代码与创造。',
  };
}

export function getSettings(): SiteSettings {
  if (!fs.existsSync(SETTINGS_FILE)) return defaultSettings();
  try {
    return { ...defaultSettings(), ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
  } catch {
    return defaultSettings();
  }
}

export function updateSettings(data: Partial<SiteSettings>): SiteSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
