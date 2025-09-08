import { handler as serveTempHandler } from '../src/app/api/serveTemp/[sessionId]/route';

export const handler = async (event, context) => {
  const sessionId = event.pathParameters?.sessionId;
  const request = { params: { sessionId } };
  const response = await serveTempHandler(request, { params: { sessionId } });
  if (response.status === 200) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=resume-${sessionId}.pdf`,
      },
      body: Buffer.from(await response.arrayBuffer()).toString('base64'),
      isBase64Encoded: true,
    };
  }
  return {
    statusCode: response.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(await response.json()),
  };
};