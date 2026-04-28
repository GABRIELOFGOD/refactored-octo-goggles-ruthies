export const adminFetch = async (url: string, options: RequestInit = { method: "GET" }) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No auth token found');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};