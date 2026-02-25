import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Tracker API',
      version: '1.0.0',
      description: 'API documentation for the Budget Tracker application',
      contact: {
        name: 'API Support',
        email: 'support@budgettracker.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'password123',
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
              example: 'USD',
            },
          },
        },
        Transaction: {
          type: 'object',
          required: ['category', 'description', 'amount', 'type'],
          properties: {
            date: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T00:00:00.000Z',
            },
            category: {
              type: 'string',
              example: 'Food & Dining',
            },
            description: {
              type: 'string',
              example: 'Grocery shopping',
            },
            amount: {
              type: 'number',
              example: 120.5,
            },
            type: {
              type: 'string',
              enum: ['income', 'expense'],
              example: 'expense',
            },
            paymentMethod: {
              type: 'string',
              enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
              example: 'card',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['grocery', 'weekly'],
            },
            recurring: {
              type: 'boolean',
              example: false,
            },
            recurringFrequency: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly', 'yearly'],
              example: 'monthly',
            },
            notes: {
              type: 'string',
              example: 'Weekly grocery shopping',
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name', 'icon', 'color', 'type'],
          properties: {
            name: {
              type: 'string',
              example: 'Food & Dining',
            },
            icon: {
              type: 'string',
              example: '🍽️',
            },
            color: {
              type: 'string',
              example: '#ef4444',
            },
            type: {
              type: 'string',
              enum: ['income', 'expense', 'both'],
              example: 'expense',
            },
            budget: {
              type: 'number',
              example: 500,
            },
          },
        },
        Budget: {
          type: 'object',
          required: ['month', 'totalBudget', 'categoryBudgets'],
          properties: {
            month: {
              type: 'string',
              format: 'date',
              example: '2024-01-01',
            },
            totalBudget: {
              type: 'number',
              example: 3000,
            },
            categoryBudgets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: {
                    type: 'string',
                    example: 'Food & Dining',
                  },
                  budget: {
                    type: 'number',
                    example: 500,
                  },
                },
              },
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
              example: 'USD',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs available at http://localhost:5000/api-docs');
};