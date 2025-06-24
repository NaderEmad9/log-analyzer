export interface ParsedTimestamp {
  original: string;
  parsed: Date | null;
  lineNumber: number;
}

export interface FileTimestampMetadata {
  fileId: string;
  fileName: string;
  earliest: Date | null;
  latest: Date | null;
  totalTimestamps: number;
}

// Common timestamp patterns found in log files
const TIMESTAMP_PATTERNS = [
  // ISO 8601: 2024-06-15T09:34:10.123Z or 2024-06-15T09:34:10
  /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)/g,
  // Standard format: 2024-06-15 09:34:10
  /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/g,
  // Date with milliseconds: 2024-06-15 09:34:10.123
  /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})/g,
  // US format: 06/15/2024 09:34:10
  /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})/g,
  // Syslog format: Jun 15 09:34:10
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{2}:\d{2}:\d{2})/g,
  // Apache log format: [15/Jun/2024:09:34:10 +0000]
  /\[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4})\]/g,
];

export const extractTimestampFromLine = (line: string): ParsedTimestamp | null => {
  for (const pattern of TIMESTAMP_PATTERNS) {
    const matches = line.match(pattern);
    if (matches && matches[0]) {
      const timestampStr = matches[0];
      let parsedDate: Date | null = null;

      try {
        // Handle different formats
        if (timestampStr.includes('/')) {
          // Handle US format or Apache format
          if (timestampStr.includes('[') || timestampStr.includes('+')) {
            // Apache format: [15/Jun/2024:09:34:10 +0000]
            const cleanStr = timestampStr.replace(/[[]]/g, '');
            parsedDate = new Date(cleanStr);
          } else {
            // US format: 06/15/2024 09:34:10
            parsedDate = new Date(timestampStr);
          }
        } else if (timestampStr.match(/^\w{3} \d{1,2} \d{2}:/)) {
          // Syslog format: Jun 15 09:34:10 (assume current year)
          const currentYear = new Date().getFullYear();
          parsedDate = new Date(`${timestampStr} ${currentYear}`);
        } else {
          // Standard ISO or similar formats
          parsedDate = new Date(timestampStr);
        }

        // Validate the parsed date
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          return {
            original: timestampStr,
            parsed: parsedDate,
            lineNumber: 0 // Will be set by caller
          };
        }
      } catch (error) {
        console.warn('Failed to parse timestamp:', timestampStr, error);
      }
    }
  }
  return null;
};

export const analyzeFileTimestamps = (content: string, fileName: string, fileId: string): FileTimestampMetadata => {
  const lines = content.split('\n');
  let earliest: Date | null = null;
  let latest: Date | null = null;
  let totalTimestamps = 0;

  lines.forEach((line, index) => {
    if (line.trim()) {
      const timestamp = extractTimestampFromLine(line);
      if (timestamp && timestamp.parsed) {
        totalTimestamps++;
        
        if (!earliest || timestamp.parsed < earliest) {
          earliest = timestamp.parsed;
        }
        if (!latest || timestamp.parsed > latest) {
          latest = timestamp.parsed;
        }
      }
    }
  });

  return {
    fileId,
    fileName,
    earliest,
    latest,
    totalTimestamps
  };
};

export const isTimestampInRange = (timestamp: Date, startDate: Date | null, endDate: Date | null): boolean => {
  if (!startDate && !endDate) return true;
  if (startDate && timestamp < startDate) return false;
  if (endDate && timestamp > endDate) return false;
  return true;
};

export const formatDateTimeRange = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate && !endDate) return 'All times';
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };

  if (startDate && endDate) {
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()} to ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
  } else if (startDate) {
    return `From ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`;
  } else if (endDate) {
    return `Until ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`;
  }
  
  return 'All times';
};
