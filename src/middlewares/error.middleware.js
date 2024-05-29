const errorMiddleware = (error, req, res, next) => {
  try {
    const response = {
      status: false,
      statusCode: error.statusCode || 500,
      errorCode: error.errorCode || 0,
      message: error.message || 'Something went wrong',
      result: error.result || {},
    };

    console.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${response.statusCode}, Message:: ${response.message}`
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
