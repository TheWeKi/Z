

export default (res, err, message = 'Response Error') => {
  const error = err;
  console.error(message, error);

  const sendData= {
    status: false,
    statusCode: 500,
    errors: [
      {
        message: 'Internal Server error',
        code: 0,
      },
    ],
  };

  if (error.code && error.code < 600) {
    sendData.statusCode = error.code;
    sendData.errors = error.errors;
  }

  return res.status(sendData.statusCode).send(sendData);
};
