export const env = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_HOST_URL, // matches your .env key
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    apikey: process.env.APPWRITE_API_KEY
  }
};
