
export function HttpException(
  res,
  status_code,
  error_messages,
  data = undefined
) {
  const sendData = {
    status: false,
    statusCode: status_code,
    errors: undefined,
    result: data || undefined,
  };

  if (typeof error_messages === 'string') {
    sendData.errors = [
      {
        message: error_messages,
        code: 0,
      },
    ];
  } else {
    sendData.errors = error_messages;
  }
  return res.status(sendData.statusCode).send(sendData);
}
