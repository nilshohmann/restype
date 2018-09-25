/**
 * Object extensions.
 */
declare interface ObjectConstructor {
  extend<T>(base: T, extension: T): T;
}

Object.extend = (base: any, extension: any): any => {
  const copy = {} as any;
  for (const key of Object.keys(base)) {
    copy[key] = base[key];
  }
  for (const key of Object.keys(extension)) {
    copy[key] = extension[key];
  }
  return copy;
};

/**
 * Promise extension.
 */
declare interface PromiseConstructor {
  sleep(seconds: number): Promise<void>;
}

Promise.sleep = (seconds: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
};
