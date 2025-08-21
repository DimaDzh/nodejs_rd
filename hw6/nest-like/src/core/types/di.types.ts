// di/types.ts
export type Constructor<T = any> = new (...args: any[]) => T;
export type Token<T = any> = string | symbol | Constructor<T>;

export type ClassProvider<T = any> = {
  provide: Token<T>;
  useClass: Constructor<T>;
  singleton?: boolean;
};

export type ValueProvider<T = any> = {
  provide: Token<T>;
  useValue: T;
};

export type FactoryProvider<T = any> = {
  provide: Token<T>;
  useFactory: (...deps: any[]) => T;
  deps?: Token[];
  singleton?: boolean;
};

export type Provider<T = any> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>;
