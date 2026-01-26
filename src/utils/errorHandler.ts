import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // eslint-disable-next-line no-console
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message ?? 'Internal Server Error',
    });
};

export const notFound = (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: 'Not found',
    });
};
