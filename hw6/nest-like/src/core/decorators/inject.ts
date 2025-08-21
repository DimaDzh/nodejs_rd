import { Token } from "../types/di.types";

const INJECT_TOKENS = Symbol("di:inject_tokens");
const INJECT_PROPS = Symbol("di:inject_props");

export function Inject(token: Token): ParameterDecorator & PropertyDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    parameterIndex?: number
  ) => {
    if (typeof parameterIndex === "number") {
      // Constructor param
      const existing: Map<number, Token> =
        Reflect.getOwnMetadata(INJECT_TOKENS, target) ?? new Map();
      existing.set(parameterIndex, token);
      Reflect.defineMetadata(INJECT_TOKENS, existing, target);
    } else if (propertyKey) {
      // Property injection
      const existing: Map<string | symbol, Token> =
        Reflect.getOwnMetadata(INJECT_PROPS, target.constructor) ?? new Map();
      existing.set(propertyKey, token);
      Reflect.defineMetadata(INJECT_PROPS, existing, target.constructor);
    }
  };
}
