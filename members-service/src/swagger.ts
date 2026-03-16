import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Members Service API",
      version: "0.1.0"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            firstName: { type: "string", example: "Jane", nullable: true },
            lastName: { type: "string", example: "Doe", nullable: true },
            isAdmin: { type: "boolean", example: false },
            membershipStatus: { type: "string", example: "inactive" },
            membershipExpiresAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" }
          },
          required: ["id", "username", "email", "isAdmin", "membershipStatus", "createdAt"]
        },
        UserResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/AuthUser" }
          },
          required: ["user"]
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
        UpdateProfileRequest: {
          type: "object",
          properties: {
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            firstName: { type: "string", example: "Jane", nullable: true },
            lastName: { type: "string", example: "Doe", nullable: true }
          }
        },
        ChangePasswordRequest: {
          type: "object",
          properties: {
            currentPassword: { type: "string", example: "old-password" },
            newPassword: { type: "string", example: "new-password" }
          },
          required: ["currentPassword", "newPassword"]
        },
        MembershipStatus: {
          type: "object",
          properties: {
            membershipStatus: { type: "string", example: "active" },
            membershipExpiresAt: { type: "string", format: "date-time", nullable: true }
          },
          required: ["membershipStatus"]
        },
        StatusUpdateRequest: {
          type: "object",
          properties: {
            status: { type: "string", example: "active" },
            expiresAt: { type: "string", format: "date-time", nullable: true }
          },
          required: ["status"]
        },
        MembershipRenewRequest: {
          type: "object",
          properties: {
            durationDays: { type: "integer", example: 30 }
          }
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
      },
      "/members/me": {
        get: {
          summary: "Get current member profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Profile",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserResponse" }
                }
              }
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Member not found" }
          }
        },
        patch: {
          summary: "Update current member profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateProfileRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Profile updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserResponse" }
                }
              }
            },
            "400": { description: "Invalid request" },
            "401": { description: "Unauthorized" },
            "409": { description: "Username or email already exists" }
          }
        }
      },
      "/members/change-password": {
        post: {
          summary: "Change password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ChangePasswordRequest" }
              }
            }
          },
          responses: {
            "200": { description: "Password updated" },
            "400": { description: "Invalid request" },
            "401": { description: "Invalid credentials" },
            "404": { description: "Member not found" }
          }
        }
      },
      "/members/{id}": {
        get: {
          summary: "Get member by id",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          responses: {
            "200": {
              description: "Profile",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/UserResponse" }
                }
              }
            },
            "400": { description: "Invalid member id" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        }
      },
      "/members/{id}/status": {
        get: {
          summary: "Get membership status",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          responses: {
            "200": {
              description: "Membership status",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MembershipStatus" }
                }
              }
            },
            "400": { description: "Invalid member id" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        },
        post: {
          summary: "Update membership status (admin)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusUpdateRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Membership status updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MembershipStatus" }
                }
              }
            },
            "400": { description: "Invalid request" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        }
      },
      "/members/{id}/membership": {
        get: {
          summary: "Get membership",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          responses: {
            "200": {
              description: "Membership",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MembershipStatus" }
                }
              }
            },
            "400": { description: "Invalid member id" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        }
      },
      "/members/{id}/membership/renew": {
        post: {
          summary: "Renew membership",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MembershipRenewRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Membership renewed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MembershipStatus" }
                }
              }
            },
            "400": { description: "Invalid request" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        }
      },
      "/members/{id}/membership/cancel": {
        post: {
          summary: "Cancel membership",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" }
            }
          ],
          responses: {
            "200": {
              description: "Membership canceled",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/MembershipStatus" }
                }
              }
            },
            "400": { description: "Invalid member id" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Member not found" }
          }
        }
      }
    }
  },
  apis: []
});
