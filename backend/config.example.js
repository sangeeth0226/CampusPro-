// Environment Configuration Example
// Copy this file to config.js and update with your actual values

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/campuspro'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here'
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name',
    apiKey: process.env.CLOUDINARY_API_KEY || 'your_cloudinary_api_key',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'your_cloudinary_api_secret'
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret'
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_email_password'
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
};
