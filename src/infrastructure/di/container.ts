export class Container {
  private static instance: Container;
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory);
  }

  registerSingleton<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  resolve<T>(key: string): T {
    // Check if we already have an instance
    if (this.services.has(key)) {
      return this.services.get(key);
    }

    // Check if we have a factory
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not registered`);
    }

    // Create instance and cache it
    const instance = factory();
    this.services.set(key, instance);
    return instance;
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
} 