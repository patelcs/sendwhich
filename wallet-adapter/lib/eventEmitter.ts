export type Listener<T> = (payload: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();
  private reEmitters = new Set<EventEmitter<Events>>();

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.off(event, listener);
    };
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    this.listeners.get(event)?.forEach((listener) => {
      listener(payload);
    });
    this.reEmitters.forEach((emitter) => {
      emitter.emit(event, payload);
    });
  }

  addReEmitter<C extends EventEmitter<Events>>(emitter: C) {
    this.reEmitters.add(emitter);
  }

  removeReEmitter<C extends EventEmitter<Events>>(emitter: C) {
    this.reEmitters.delete(emitter);
  }
}
