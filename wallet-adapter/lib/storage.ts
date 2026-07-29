export class LocalStorage {
  private static checkWindow() {
    if (!window.localStorage) throw new Error('Not inside Browser');
  }
  static save(key: string, value: Record<string, any>) {
    this.checkWindow();
    window.localStorage.setItem(key, JSON.stringify(value));
  }
  static load<T extends Record<string, any>>(key: string) {
    this.checkWindow();
    const strVal = window.localStorage.getItem(key);
    if (!strVal) return null;
    const parsed: T = JSON.parse(strVal);
    return parsed;
  }
  static remove(key: string) {
    this.checkWindow();
    window.localStorage.removeItem(key);
  }
}