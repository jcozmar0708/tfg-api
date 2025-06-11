import { ConfigService } from '@nestjs/config';

const getEnvString = (key: string, configService: ConfigService): string => {
  const value = configService.get<string>(key);
  if (value === undefined) {
    throw new Error(`No se encuentra la variable: ${key}`);
  }

  return value;
};

export const getConstants = (configService: ConfigService) => ({
  PORT: parseInt(getEnvString('PORT', configService)),

  CORS_ORIGIN: getEnvString('CORS_ORIGIN', configService),
  FRONT_URL: getEnvString('FRONT_URL', configService),

  MAIL_HOST: getEnvString('MAIL_HOST', configService),
  MAIL_PORT: parseInt(getEnvString('MAIL_PORT', configService)),
  MAIL_USER: getEnvString('MAIL_USER', configService),
  MAIL_PASSWORD: getEnvString('MAIL_PASSWORD', configService),

  VERIFICATION_CODE_EXPIRATION_MS: parseInt(
    getEnvString('VERIFICATION_CODE_EXPIRATION_MS', configService),
  ),
  RESEND_INTERVAL_MS: parseInt(
    getEnvString('RESEND_INTERVAL_MS', configService),
  ),
  MAX_VERIFICATION_ATTEMPTS: parseInt(
    getEnvString('MAX_VERIFICATION_ATTEMPTS', configService),
  ),
  UNVERIFIED_USER_EXPIRATION_MS: parseInt(
    getEnvString('UNVERIFIED_USER_EXPIRATION_MS', configService),
  ),

  JWT_SECRET_KEY: getEnvString('JWT_SECRET_KEY', configService),
  JWT_TOKEN_EXPIRATION_MS: parseInt(
    getEnvString('JWT_TOKEN_EXPIRATION_MS', configService),
  ),

  PAYPAL_CLIENT_ID: getEnvString('PAYPAL_CLIENT_ID', configService),
  PAYPAL_SECRET: getEnvString('PAYPAL_SECRET', configService),
  PAYPAL_API: getEnvString('PAYPAL_API', configService),
});
