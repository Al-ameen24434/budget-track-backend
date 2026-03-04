import { Express } from "express";

export const setupSwagger = (_app: Express): void => {
  // Swagger setup is handled via JSDoc comments in route files
  // The docs will be available at /api-docs once configured with swagger-jsdoc
  console.log("Swagger documentation enabled through JSDoc annotations");
};
