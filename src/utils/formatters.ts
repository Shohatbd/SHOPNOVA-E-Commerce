/**
 * SHOPHATBD Bilingual Text & Name Formatters
 */

export const formatBilingualName = (name: string | undefined | null, isBn: boolean): string => {
  if (!name) return '';
  const trimmed = name.trim();

  // Pattern 1: "Bangla (English)" or "English (Bangla)" e.g. "রহিম আহমেদ (Rahim Ahmed)"
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    const part1 = parenMatch[1].trim();
    const part2 = parenMatch[2].trim();
    const hasBn1 = /[\u0980-\u09FF]/.test(part1);
    const hasBn2 = /[\u0980-\u09FF]/.test(part2);

    if (hasBn1 && !hasBn2) {
      return isBn ? part1 : part2;
    }
    if (!hasBn1 && hasBn2) {
      return isBn ? part2 : part1;
    }
    return isBn ? part1 : part2;
  }

  // Pattern 2: "Part1 / Part2" or "Part1 - Part2"
  const delimiterMatch = trimmed.split(/\s*[\/\-]\s*/);
  if (delimiterMatch.length === 2) {
    const part1 = delimiterMatch[0].trim();
    const part2 = delimiterMatch[1].trim();
    const hasBn1 = /[\u0980-\u09FF]/.test(part1);
    const hasBn2 = /[\u0980-\u09FF]/.test(part2);

    if (hasBn1 && !hasBn2) {
      return isBn ? part1 : part2;
    }
    if (!hasBn1 && hasBn2) {
      return isBn ? part2 : part1;
    }
  }

  // Common user names translation fallback
  if (trimmed.toLowerCase() === 'rahim ahmed' || trimmed === 'রহিম আহমেদ') {
    return isBn ? 'রহিম আহমেদ' : 'Rahim Ahmed';
  }
  if (trimmed.toLowerCase() === 'md liakot ali' || trimmed === 'মোঃ লিয়াকত আলী' || trimmed === 'মো: লিয়াকত আলী') {
    return isBn ? 'মোঃ লিয়াকত আলী' : 'Md Liakot Ali';
  }

  return trimmed;
};

export const getAvatarInitial = (name: string | undefined | null, isBn: boolean): string => {
  const displayName = formatBilingualName(name, isBn);
  if (!displayName) return 'U';
  return displayName.charAt(0).toUpperCase();
};

/**
 * Formats ISO / SQLite UTC timestamp strings accurately into Bangladesh Standard Time (BST, UTC+6).
 */
export const formatDateTime = (dateStr: string | Date | undefined | null, isBn: boolean = false): string => {
  if (!dateStr) return 'N/A';
  try {
    let dateObj: Date;
    if (dateStr instanceof Date) {
      dateObj = dateStr;
    } else {
      let str = String(dateStr).trim();
      // SQLite "YYYY-MM-DD HH:MM:SS" without Z or offset: treat as UTC
      if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/.test(str)) {
        str = str.replace(' ', 'T') + 'Z';
      } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
        str = str + 'Z';
      }
      dateObj = new Date(str);
    }

    if (isNaN(dateObj.getTime())) {
      return String(dateStr);
    }

    return dateObj.toLocaleString(isBn ? 'bn-BD' : 'en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    return String(dateStr);
  }
};
