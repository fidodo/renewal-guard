import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { SERVER_URL, NEXT_PUBLIC_API_URL } from "../backend/config/env.js";

const API_BASE_URL = NEXT_PUBLIC_API_URL || SERVER_URL;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My App renewal guard API",
      version: "1.0.0",
      description: "API documentation for renewal guard backend",
    },
    servers: [
      {
        url: `${API_BASE_URL}/api`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // where your route files live
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export default setupSwagger;
