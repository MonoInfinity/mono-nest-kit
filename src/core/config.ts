import { monoEnum } from 'mono-utils-core';

export const config = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USERNAME: process.env.DB_USERNAME || 'postgresdocker',
    DB_PASSWORD: process.env.DB_PASSWORD || '1234567890',
    DB_NAME: process.env.DB_NAME || 'myapp',
    DB_PORT: Number(process.env.DB_PORT) || 5432,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || '',
    GOOGLE_CLIENT_REDIRECT_URL: process.env.GOOGLE_CLIENT_REDIRECT_URL || 'http://localhost:4000',

    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || '',
    FACEBOOK_CLIENT_REDIRECT_URL: process.env.FACEBOOK_CLIENT_REDIRECT_URL || 'http://localhost:4000',

    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'this is secret',
    CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:4000',

    SENDGRID_KEY: process.env.SENDGRID_KEY || '',
    SENDGRID_SENDER: process.env.SENDGRID_SENDER || '',
    SENDGRID_URL: process.env.SENDGRID_URL || '',

    PORT: Number(process.env.PORT) || 4000,
    NODE_ENV: process.env.NODE_ENV || monoEnum.NODE_ENV_MODE.DEVELOPMENT,
    DEBUG: process.env.DEBUG || '',
};
