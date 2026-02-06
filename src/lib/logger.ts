import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'area-drilldown.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Clear log on server start
if (fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, `=== Server started at ${new Date().toISOString()} ===\n\n`);
}

function formatLog(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  let logLine = `[${timestamp}] [${level}] ${message}`;

  if (data !== undefined) {
    if (typeof data === 'object') {
      logLine += '\n' + JSON.stringify(data, null, 2);
    } else {
      logLine += ' ' + String(data);
    }
  }

  return logLine + '\n';
}

function writeLog(level: string, message: string, data?: any) {
  const logLine = formatLog(level, message, data);

  // Write to console
  console.log(logLine);

  // Write to file
  try {
    fs.appendFileSync(LOG_FILE, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export const logger = {
  info: (message: string, data?: any) => writeLog('INFO', message, data),
  warn: (message: string, data?: any) => writeLog('WARN', message, data),
  error: (message: string, data?: any) => writeLog('ERROR', message, data),
  debug: (message: string, data?: any) => writeLog('DEBUG', message, data),

  // Separator for readability
  separator: () => {
    const sep = '\n' + '='.repeat(80) + '\n\n';
    fs.appendFileSync(LOG_FILE, sep);
  },
};
