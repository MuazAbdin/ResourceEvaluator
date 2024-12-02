export default class Logger {
  static info(message: string) {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`);
  }

  static error(message: string, error?: unknown) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static warn(message: string) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
}
