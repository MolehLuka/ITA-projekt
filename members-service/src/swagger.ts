import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Members Service API",
      version: "0.1.0"
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          description: "Checks API and database connectivity.",
          responses: {
            "200": {
              description: "Service is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      database: { type: "string", example: "up" }
                    },
                    required: ["status", "database"]
                  }
                }
              }
            },
            "503": {
              description: "Database is unavailable",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "degraded" },
                      database: { type: "string", example: "down" }
                    },
                    required: ["status", "database"]
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
});
