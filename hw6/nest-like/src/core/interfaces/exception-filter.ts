export interface ExceptionFilter {
  catch(error: any, context: any): void;
}
