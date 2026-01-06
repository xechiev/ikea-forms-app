import type { ParsedJob, JobType } from '../types';

/**
 * Parse job information from Google Calendar text
 * 
 * Example inputs:
 * - "Confirmed IKEA prefit RENEE VIDA 18452062614"
 * - "Confirmed/IKEA CT Windzer Pierre-Louis 12033260349"
 * - "Confirmed/wo/IKEA CT Wayne Zhan 12032430501"
 * - "IKEA NY Leslie Yung 19176900772"
 */
export function parseJobText(text: string): ParsedJob | null {
  const lines = text.trim().split('\n').map(line => line.trim()).filter(Boolean);
  
  if (lines.length < 1) {
    return null;
  }

  const firstLine = lines[0];
  
  // Determine job type
  const jobType = detectJobType(firstLine);
  
  // Extract customer name and phone from first line
  const { name, phone, region } = parseFirstLine(firstLine);
  
  if (!name) {
    return null;
  }
  
  // Find address line (contains ZIP code - 5 digits)
  const address = findAddressLine(lines);
  
  // Find date/time line (contains time pattern)
  const { date, time } = parseDateTimeLine(lines);
  
  // Remaining lines are notes
  const notes = extractNotes(lines, address);
  
  // Determine status
  const status = firstLine.toLowerCase().includes('confirmed') ? 'confirmed' : 'pending';

  return {
    status,
    jobType,
    region,
    customer: {
      name,
      phone,
    },
    address,
    date,
    time,
    notes,
  };
}

/**
 * Detect job type from first line
 */
function detectJobType(line: string): JobType {
  const lowerLine = line.toLowerCase();
  
  if (lowerLine.includes('prefit')) {
    return 'prefit';
  }
  
  if (lowerLine.includes('/wo/') || lowerLine.includes(' wo ')) {
    return 'wo';
  }
  
  return 'installation';
}

/**
 * Parse first line to extract customer name, phone, and region
 * 
 * Patterns:
 * - "Confirmed IKEA prefit RENEE VIDA 18452062614"
 * - "Confirmed/IKEA CT Windzer Pierre-Louis 12033260349"
 * - "Ikea NY Leslie Yung 19176900772"
 */
function parseFirstLine(line: string): { name: string; phone: string; region: string } {
  // Extract phone (10-11 digits at the end)
  const phoneMatch = line.match(/(\d{10,11})$/);
  const phone = phoneMatch ? phoneMatch[1] : '';
  
  // Remove phone from line for further processing
  let processedLine = line.replace(/\d{10,11}$/, '').trim();
  
  // Find IKEA position
  const ikeaIndex = processedLine.toLowerCase().indexOf('ikea');
  if (ikeaIndex === -1) {
    return { name: '', phone, region: '' };
  }
  
  // Get part after IKEA
  let afterIkea = processedLine.substring(ikeaIndex + 4).trim();
  
  // Remove 'prefit', 'wo' if present
  afterIkea = afterIkea.replace(/\bprefit\b/gi, '').trim();
  afterIkea = afterIkea.replace(/\bwo\b/gi, '').trim();
  
  // Check for region (2 uppercase letters)
  const regionMatch = afterIkea.match(/^([A-Z]{2})\s+/);
  let region = '';
  if (regionMatch) {
    region = regionMatch[1];
    afterIkea = afterIkea.substring(regionMatch[0].length).trim();
  }
  
  // Remaining is the customer name (2-3 capitalized words)
  // Clean up any remaining slashes or special characters
  const name = afterIkea
    .replace(/[\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return { name: formatName(name), phone, region };
}

/**
 * Format name with proper capitalization
 */
function formatName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Find address line in the text
 * Address contains ZIP code (5 digits) and state abbreviation
 */
function findAddressLine(lines: string[]): string {
  for (const line of lines) {
    // Check for US ZIP code pattern (5 digits, optionally followed by -4 digits)
    // Also check for common patterns like "NY 10573" or "CT 06032"
    if (/\b\d{5}(-\d{4})?\b/.test(line) && /\b[A-Z]{2}\b/.test(line)) {
      // Clean up common suffixes
      return line
        .replace(/\s*(United States|USA|Unit)$/i, '')
        .trim();
    }
  }
  return '';
}

/**
 * Parse date and time from lines
 * Format: "Пятница, 12 декабря⋅11:00AM–3:00PM" or "Friday, December 12⋅11:00AM–3:00PM"
 */
function parseDateTimeLine(lines: string[]): { date: string; time: string } {
  for (const line of lines) {
    // Check for time pattern (contains AM/PM or time separator)
    if (/\d{1,2}:\d{2}/.test(line) || /[–-]\d/.test(line)) {
      // Split by the middle dot or bullet
      const parts = line.split(/[⋅•·]/);
      
      const datePart = parts[0]?.trim() || '';
      const timePart = parts[1]?.trim() || '';
      
      return {
        date: datePart,
        time: timePart,
      };
    }
  }
  return { date: '', time: '' };
}

/**
 * Extract notes from remaining lines
 */
function extractNotes(lines: string[], address: string): string {
  const notes: string[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip date/time line
    if (/\d{1,2}:\d{2}/.test(line) || /[–-]\d/.test(line)) {
      continue;
    }
    
    // Skip address line
    if (line === address || (address && line.includes(address))) {
      continue;
    }
    
    // Skip empty-ish lines
    if (line.length < 3) {
      continue;
    }
    
    notes.push(line);
  }
  
  return notes.join('\n');
}

/**
 * Get required forms for a job type
 */
export function getRequiredForms(jobType: JobType): string[] {
  switch (jobType) {
    case 'installation':
      return ['startNotes', 'kitchenArticles', 'changeNotes', 'completionReport', 'wallAnchoring'];
    case 'wo':
      return ['changeNotes', 'completionReport'];
    case 'prefit':
      return ['siteCondition'];
  }
}

/**
 * Get form display name
 */
export function getFormDisplayName(formKey: string, language: 'en' | 'ru' = 'en'): string {
  const names: Record<string, { en: string; ru: string }> = {
    startNotes: { en: 'Start Notes', ru: 'Стартовые заметки' },
    changeNotes: { en: 'Change Notes', ru: 'Изменения' },
    kitchenArticles: { en: 'Kitchen Articles Request', ru: 'Запрос артикулов' },
    completionReport: { en: 'Completion Report', ru: 'Отчёт о завершении' },
    wallAnchoring: { en: 'Wall Anchoring', ru: 'Крепление к стене' },
    siteCondition: { en: 'Site Condition Report', ru: 'Отчёт о состоянии' },
  };
  
  return names[formKey]?.[language] || formKey;
}
