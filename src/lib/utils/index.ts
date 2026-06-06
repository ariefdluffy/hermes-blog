export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u024f]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function formatDate(date: string | Date, locale = 'en-US'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function excerptFromContent(content: string, maxLength = 160): string {
  const plain = content
    .replace(/[#*`>\[\]()!_~-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return truncate(plain, maxLength);
}

export function generateUniqueSlug(base: string): string {
  const timestamp = Date.now().toString(36);
  return `${slugify(base)}-${timestamp}`;
}