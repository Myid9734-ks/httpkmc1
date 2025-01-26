// 로그 레벨 정의
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 현재 환경 설정
declare const process: {
  env: {
    NODE_ENV: string;
  };
};

const isDevelopment = process.env.NODE_ENV === 'development';

// 민감한 데이터 필드 마스킹 처리
const maskSensitiveData = (data: any): any => {
  if (!data) return data;
  
  const maskedData = { ...data };
  const sensitiveFields = ['password', 'token', 'apiKey'];
  
  sensitiveFields.forEach(field => {
    if (maskedData[field]) {
      maskedData[field] = '********';
    }
  });
  
  return maskedData;
};

// 로그 유틸리티 클래스
class Logger {
  private static instance: Logger;
  private currentLogLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentIndex = levels.indexOf(this.currentLogLevel);
    const targetIndex = levels.indexOf(level);
    return targetIndex <= currentIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;
    return;
  }

  error(message: string, data?: any): void {
    this.formatMessage(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.formatMessage(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.formatMessage(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.formatMessage(LogLevel.DEBUG, message, data);
  }
}

export const logger = Logger.getInstance(); 