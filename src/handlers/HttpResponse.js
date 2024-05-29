
export function HttpResponse(
  res ,
  statusCode,
  message,
  result
) {
  const sendData = {
    status: true,
    statusCode: statusCode,
    message: message,
    result: result || {},
  };
  return res.status(sendData.statusCode).send(sendData);
}
