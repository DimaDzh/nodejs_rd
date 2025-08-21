import "reflect-metadata";
import { ExceptionFilter } from "../interfaces/exception-filter";

export function UseFilter(filter: new () => ExceptionFilter) {
  return function (target: any, propertyKey?: string | symbol) {
    if (propertyKey) {
      // Метод-декоратор
      Reflect.defineMetadata("filters", [filter], target, propertyKey);
    } else {
      // Клас-декоратор
      Reflect.defineMetadata("filters", [filter], target);
    }
  };
}
