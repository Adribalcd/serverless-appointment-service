import { APIGatewayProxyHandler } from 'aws-lambda';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as swaggerUi from 'swagger-ui-dist';

export const swaggerDocs: APIGatewayProxyHandler = async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'docs/swagger.yml');
    const swaggerYaml = fs.readFileSync(filePath, 'utf8');
    const swaggerJson = yaml.load(swaggerYaml);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>API Docs</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
          <script>
            SwaggerUIBundle({
              spec: ${JSON.stringify(swaggerJson)},
              dom_id: '#swagger-ui',
            });
          </script>
        </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
