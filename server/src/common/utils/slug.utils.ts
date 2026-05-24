import * as crypto from 'crypto';

export function generateSlug(text: string): string {
  const base = (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // separate diacritics
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric (except spaces/hyphens)
    .replace(/[\s_]+/g, '-') // replace spaces/underscores with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens

  const cleanBase = base || 'item';
  const timeframe = Date.now().toString(36);
  const shortUuid = crypto.randomUUID().split('-')[0].substring(0, 5);

  return `${cleanBase}-${timeframe}-${shortUuid}`;
}
