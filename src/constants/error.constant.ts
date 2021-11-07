import 'dotenv/config';

export const ERROR_CODE = {
  DUPLICATE: 11000,
};

export const JWT_OPTIONS = {
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '3h' },
};
