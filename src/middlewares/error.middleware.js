import {NextFunction, Request, Response} from 'express';
import {HttpException} from '../handlers/HttpException';
import {logger} from '../utilities/logger/winston_logger';

const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = {
      status: false,
      statusCode: error.statusCode || 500,
      errorCode: error.errorCode || 0,
      message: error.message || 'Something went wrong',
      result: error.result || {},
    };

    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${response.statusCode}, Message:: ${response.message}`
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
