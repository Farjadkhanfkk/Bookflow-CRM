import { createHash,createHmac,randomBytes,timingSafeEqual } from 'node:crypto';
import 'server-only';
import { config } from './config';

export function hashToken(value: string) { return createHash('sha256').update(value).digest('hex'); }
export function newToken() { return randomBytes(32).toString('base64url'); }
export function manageToken(holdId: string) {
  return createHmac('sha256', config().BOOKING_TOKEN_SECRET).update(`manage:${holdId}`).digest('base64url');
}
export function equalSecret(a: string, b: string) {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
