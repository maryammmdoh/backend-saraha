import { client } from "./redis.connection.js";

export function getBlacklistTokenKey({ userId, tokenId }) {
  return `blacklistToken::${userId}::${tokenId}`;
}

export function getOTPKey({ email, emailType }) {
  return `OTP::${email}::${emailType}`;
}

export function getOTPReqNoKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::No`;
}

export function getOTPReqBlockedKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::Blocked`;
}


export async function set({ key, value, exType = "EX", exValue = 50 }) {
  return await client.set(key, value, {
    expiration: { type: exType, value: Math.floor(exValue) },
  });
}

export async function incr({ key }) {
  return await client.incr(key);
}

export async function decr({ key }) {
  return await client.decr(key);
}

export async function hset({ fields }) {
  return await client.hSet(fields);
}

export async function update({ key, value }) {
  const exists = await client.exists(key);
  if (!exists) {
    throw new Error("Key does not exist --> 0");
  }
  return await client.set(key, value);
}

export async function remove( {keys} ) {
  return await client.del(keys);
}

export async function ttl( {key} ) {
  return await client.ttl(key);
}

export async function setExpire( {key, seconds} ) {
  return await client.expire(key, seconds);
}

export async function removeExpire( {key} ) {
  return await client.persist(key);
}

export async function get( {key} ) {
  return await client.get(key);
}

export async function mget( {keys} ) {
  return await client.mget(keys);
}

export async function exists( {key} ) {
  return await client.exists(key);
}
