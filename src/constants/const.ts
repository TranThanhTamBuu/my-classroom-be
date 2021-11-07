import 'dotenv/config';

export const ERROR_CODE = {
  DUPLICATE: 11000,
};

export const JWT_OPTIONS = {
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '3h' },
};

export const AUTHENTICATION_THIRD_PARTY = {
  GOOGLE: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['email', 'profile'],
  },
  MICROSOFT: {
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    scope: ['user.read'],
  },
};
