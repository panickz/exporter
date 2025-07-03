import { randomBytes } from 'crypto';

export function generateDownloadToken(): string {
  return randomBytes(32).toString('hex');
}

export function createExpiryDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + 120 * 1000); // 120
}
