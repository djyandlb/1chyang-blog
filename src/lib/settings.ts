// src/lib/settings.ts — 站点设置（支持 Netlify Blobs）
import { readData, writeData } from './dataStore';

const DATA_NAME = 'settings';

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

/** 获取设置 */
export async function getSettings(): Promise<SiteSettings> {
  const data = await readData<SiteSettings>(DATA_NAME);
  // settings 不是数组，是单对象
  if (Array.isArray(data) && data.length > 0) {
    return { ...defaultSettings(), ...(data[0] as any) };
  }
  if (!Array.isArray(data) && data !== null && typeof data === 'object') {
    return { ...defaultSettings(), ...(data as any) };
  }
  return defaultSettings();
}

/** 更新设置 */
export async function updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings();
  const updated = { ...current, ...data };
  // 存储为数组格式（兼容 dataStore 的数组读写）
  await writeData(DATA_NAME, [updated]);
  return updated;
}
