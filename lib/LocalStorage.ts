import z from 'zod';

export class LocalStorage {
  private static checkWindow() {
    if (!window || !window.localStorage) throw new Error('LocalStorage is only supported inside Browser');
  }

  static save<T>(key: string, value: T) {
    this.checkWindow();
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  static load<T>(key: string, schema: z.ZodType<T>) {
    this.checkWindow();
    const strVal = window.localStorage.getItem(key);
    if (!strVal) return null;
    try {
      const json = JSON.parse(strVal);
      return schema.parse(json);
    } catch (error) {
      console.error(`LocalStorage load error ${key}:`, error);
      return null;
    }
  }

  static loadArray<T>(key: string, schema: z.ZodType<T>): T[] {
    this.checkWindow();

    const strVal = window.localStorage.getItem(key);
    if (!strVal) return [];

    try {
      const json: unknown = JSON.parse(strVal);

      if (!Array.isArray(json)) {
        console.error(`LocalStorage load error expected array ${key}:`);
        return [];
      }

      return json
        .map((item) => schema.safeParse(item))
        .filter((result, i): result is z.ZodSafeParseSuccess<T> => {
          if (!result.success) console.error('loadArray', key, i, result);
          return result.success;
        })
        .map((result) => result.data);
    } catch (error) {
      console.error(`LocalStorage load array error ${key}:`, error);
      return [];
    }
  }

  static remove(key: string) {
    this.checkWindow();
    window.localStorage.removeItem(key);
  }
}
