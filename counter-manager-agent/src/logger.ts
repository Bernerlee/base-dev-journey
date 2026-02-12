export function log(...args: any[]) {
  console.log(new Date().toISOString(), "-", ...args);
}

export function warn(...args: any[]) {
  console.warn(new Date().toISOString(), "-", ...args);
}

export function err(...args: any[]) {
  console.error(new Date().toISOString(), "-", ...args);
}
