import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Returns a human-friendly relative or absolute time string in Korean.
 * Guarantees that future times (e.g. slight clock differences) are never rendered as "X시간 후".
 */
export function formatRelativeTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  
  // Future dates or instantaneous current times are formatted safely
  if (date.getTime() >= now.getTime()) {
    return '방금 전';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMinutes < 1) {
    return '방금 전';
  }
  
  if (diffHours < 1) {
    return `${diffMinutes}분 전`;
  }
  
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }
  
  if (diffDays <= 7) {
    return `${diffDays}일 전`;
  }
  
  return format(date, 'yyyy.MM.dd', { locale: ko });
}

/**
 * Formats a date string into standard Korean date and time representation (e.g., 2026. 08. 31 08:35).
 */
export function formatArticleDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  return format(date, 'yyyy. MM. dd HH:mm', { locale: ko });
}
