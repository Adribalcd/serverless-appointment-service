import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  MYSQL_PE_HOST: process.env.MYSQL_PE_HOST!,
  MYSQL_PE_DB: process.env.MYSQL_PE_DB!,
  MYSQL_PE_USER: process.env.MYSQL_PE_USER!,
  MYSQL_PE_PASSWORD: process.env.MYSQL_PE_PASSWORD!,
  MYSQL_CL_HOST: process.env.MYSQL_CL_HOST!,
  MYSQL_CL_DB: process.env.MYSQL_CL_DB!,
  MYSQL_CL_USER: process.env.MYSQL_CL_USER!,
  MYSQL_CL_PASSWORD: process.env.MYSQL_CL_PASSWORD!,
};
