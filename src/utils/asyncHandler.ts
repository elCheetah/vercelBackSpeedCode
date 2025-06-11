import { Request, Response, NextFunction } from 'express';

// Función para capturar errores de middlewares async sin necesidad de try-catch en cada ruta
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
