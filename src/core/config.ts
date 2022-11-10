import { monoEnum } from 'mono-utils-core';

export const config = {
    DB_HOST: process.env.DB_HOST || '159.223.60.221',
    DB_USERNAME: process.env.DB_USERNAME || 'monoteam',
    DB_PASSWORD: process.env.DB_PASSWORD || '272019289384Aa',
    DB_NAME: process.env.DB_NAME || 'rentcardemo',
    DB_PORT: Number(process.env.DB_PORT) || 5432,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '495690914730-fd21r6k7kokoqu4hrkns12ml9igcaong.apps.googleusercontent.com',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || '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',
    GOOGLE_CLIENT_REDIRECT_URL: process.env.GOOGLE_CLIENT_REDIRECT_URL || 'http://localhost:4000',

    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
    FACEBOOK_SECRET: process.env.FACEBOOK_SECRET || '',
    FACEBOOK_CLIENT_REDIRECT_URL: process.env.FACEBOOK_CLIENT_REDIRECT_URL || 'http://localhost:4000',

    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY2MDI5MTI4NCwiaWF0IjoxNjYwMjkxMjg0fQ',
    CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:4000',

    SENDGRID_KEY: process.env.SENDGRID_KEY || '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',
    SENDGRID_SENDER: process.env.SENDGRID_SENDER || 'norely <service@monoinfinity.net>',

    REDIS_URL: process.env.REDIS_URL || 'redis://159.223.60.221:6379',

    MOMO_PAYMENT_ENDPOINT: process.env.MOMO_PAYMENT_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    MOMO_CALLBACK_ENDPOINT: process.env.MOMO_CALLBACK_ENDPOINT || 'http://localhost:4000/payment/callback',
    MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || 'MOMO',
    MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    MOMO_SIGNATURE_PRIVATE_KEY: process.env.MOMO_SIGNATURE_PRIVATE_KEY || '5ae6941e28658609c0219408b1d4409c49ada14029ce4e592786243fa35d4b68',
    MOMO_SIGNATURE_PUBLIC_KEY:
        process.env.MOMO_SIGNATURE_PUBLIC_KEY || '04b4770d534ac6e671a3637c49b182132f6ed764df59fd9cf95e80dba63661143fc66c185e791ea1262640b7e374de39d6f91b89bebd88a2b899f496b51b1176b2',

    PORT: Number(process.env.PORT) || 4000,
    NODE_ENV: process.env.NODE_ENV || monoEnum.NODE_ENV_MODE.DEVELOPMENT,
    DEBUG: process.env.DEBUG || '',
};
