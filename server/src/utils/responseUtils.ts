import { Response } from 'express';
export const getHtmlErrorResponse = (message: string): string => {
    return `<h1>${message}</h1>`;
};
export const sendErrorResponse = (res: Response, statusCode: number, message: string, format: 'json' | 'html' = 'json'): void => {
    if (format === 'html') {
        res.status(statusCode).send(getHtmlErrorResponse(message));
    } else {
        res.status(statusCode).json({ error: message });
    }
};
