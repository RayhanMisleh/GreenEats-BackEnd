const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, errors } = format;

// Minimal ANSI color helpers to avoid chalk/ESM issues
const ansi = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const color = {
  red: (s) => `${ansi.red}${s}${ansi.reset}`,
  yellow: (s) => `${ansi.yellow}${s}${ansi.reset}`,
  cyan: (s) => `${ansi.cyan}${s}${ansi.reset}`,
  magenta: (s) => `${ansi.magenta}${s}${ansi.reset}`,
  gray: (s) => `${ansi.gray}${s}${ansi.reset}`,
  dim: (s) => `${ansi.dim}${s}${ansi.reset}`,
};

// Map levels to emojis
const levelEmoji = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  http: '🌐',
  debug: '🐞',
};

// Pretty-print metadata (small helper)
function formatMeta(meta) {
  try {
    if (!meta || (typeof meta === 'object' && Object.keys(meta).length === 0)) return '';
    return color.dim(` ${JSON.stringify(meta)}`);
  } catch (e) {
    return '';
  }
}

// Human-friendly console format with emoji and colors
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const time = color.gray(new Date(timestamp).toLocaleTimeString());
  const emoji = levelEmoji[level] || '';
  const lvl = level.toUpperCase();
  const metaStr = formatMeta(meta);
  const err = stack ? `\n${color.red(stack)}` : '';

  // Colorize level
  let levelColored = lvl;
  if (level === 'error') levelColored = color.red(lvl);
  else if (level === 'warn') levelColored = color.yellow(lvl);
  else if (level === 'info' || level === 'http') levelColored = color.cyan(lvl);
  else if (level === 'debug') levelColored = color.magenta(lvl);

  return `${time} ${emoji} ${levelColored} ${message}${metaStr}${err}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), errors({ stack: true }), consoleFormat),
  transports: [new transports.Console()],
  defaultMeta: { service: 'greeneats-backend' },
});

// Stream object for morgan to write HTTP logs to console via winston
logger.stream = {
  write: (message) => {
    // Morgan message examples include trailing newline
    logger.info(message.trim());
  },
};

module.exports = logger;
