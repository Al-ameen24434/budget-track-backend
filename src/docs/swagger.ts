import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.json";

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
