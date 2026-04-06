import swaggerJsdoc from "swagger-jsdoc";
import { writeFileSync } from "fs";
import { join } from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Budget Tracker API",
      version: "1.0.0",
      description: "REST API for managing budgets, categories and transactions",
    },
    servers: [{ url: "/api", description: "API base" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const spec = swaggerJsdoc(options);
writeFileSync(join(__dirname, "../src/docs/swagger.json"), JSON.stringify(spec, null, 2));
console.log("swagger.json generated");
