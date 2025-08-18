export default function httpError(
  status: number,
  success: boolean,
  message: string,
  data: null | object
) {
  return Response.json(
    { status, success, message, data },
    { status }
  );
}
  