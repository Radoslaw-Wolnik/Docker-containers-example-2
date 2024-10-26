declare global {
    namespace NodeJS {
      interface ProcessEnv {
        // Database
        DATABASE_URL: string;
        
        // Next Auth
        NEXTAUTH_URL: string;
        NEXTAUTH_SECRET: string;
        
        // Upload settings
        UPLOAD_MAX_SIZE: string;
        ALLOWED_IMAGE_TYPES: string;
        STORAGE_PATH: string;
        
        // Redis
        REDIS_URL: string;
        
        // Rate limiting
        RATE_LIMIT_WINDOW: string;
        RATE_LIMIT_MAX_REQUESTS: string;
        
        // Environment
        NODE_ENV: 'development' | 'production' | 'test';
        
        // Email
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_USER: string;
        SMTP_PASSWORD: string;
        EMAIL_FROM: string;
        
        // Image processing
        IMAGE_DOMAIN: string;
        
        // API keys
        API_SECRET_KEY: string;
        
        [key: string]: string | undefined;
      }
    }
  }
  
  // Ensure this is treated as a module
  export {};