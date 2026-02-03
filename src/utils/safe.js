// src/utils/safe.js

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function asArrayOfObjects(value) {
  return asArray(value).filter((x) => x && typeof x === "object");
}
