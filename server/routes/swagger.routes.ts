import type { Express } from "express";
import { getOpenApiSpec } from "../swagger/openapi.js";

export function registerSwaggerRoutes(app: Express): void {
  app.get("/api-docs", (req, res) => {
    const host = req.headers.host || "localhost:3000";
    res.json(getOpenApiSpec(host));
  });

  app.get("/swagger-ui.html", (req, res) => {
    const host = req.headers.host || "localhost:3000";
    const spec = JSON.stringify(getOpenApiSpec(host));
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AFG BANK GABON - Documentation Centralisée d'API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; }
    .swagger-ui .topbar { background-color: #0052CC !important; border-bottom: 3px solid #00C853; }
    .swagger-ui .info .title { color: #002D72 !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: ${spec},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
  `;
    res.send(html);
  });
}
