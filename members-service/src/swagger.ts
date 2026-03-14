import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Members Service API",
      version: "0.1.0"
    },
    components: {
      schemas: {
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            firstName: { type: "string", example: "Jane", nullable: true },
            lastName: { type: "string", example: "Doe", nullable: true },
            createdAt: { type: "string", format: "date-time" }
          },
          required: ["id", "username", "email", "createdAt"]
        },
        RegisterRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            password: { type: "string", example: "strong-password" },
            firstName: { type: "string", example: "Jane", nullable: true },
            lastName: { type: "string", example: "Doe", nullable: true }
          },
          required: ["username", "email", "password"]
        },
        LoginRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            password: { type: "string", example: "strong-password" }
          },
          required: ["password"]
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/AuthUser" }
          },
          required: ["token", "user"]
        }
      }
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
      },
      "/members/register": {
        post: {
          summary: "Register a member",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Member registered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            "400": { description: "Invalid request" },
            "409": { description: "Username or email already exists" }
          }
        }
      },
      "/members/login": {
        post: {
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Authenticated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            "400": { description: "Invalid request" },
            "401": { description: "Invalid credentials" }
          }
        }
      }
    }
  },
  apis: []
});
