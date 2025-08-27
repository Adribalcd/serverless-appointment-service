import { APIGatewayProxyHandler } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export const swaggerDocs: APIGatewayProxyHandler = async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'swagger.yml');

    const swaggerYaml = fs.readFileSync(filePath, 'utf8');
    const swaggerJson = yaml.load(swaggerYaml);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swaggerJson, null, 2),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
