import { handler as generateResumeHandler } from '../src/app/api/generateResume/route';

export const handler = async (event, context) => {
  const request = {
    formData: async () => {
      const formData = new FormData();
      const body = JSON.parse(event.body || '{}');
      Object.entries(body).forEach(([key, value]) => formData.append(key, value));
      return formData;
    },
  };
  const response = await generateResumeHandler(request);
  return {
    statusCode: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(await response.json()),
  };
};