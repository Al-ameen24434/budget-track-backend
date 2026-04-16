# 💰 Budget Tracker API

A production-ready RESTful API for personal finance management built with Node.js, Express, TypeScript, and MongoDB. Track income, expenses, manage budgets, and gain insights with advanced analytics.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-red)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** - Secure user authentication with token-based authorization
- 💰 **Transaction Management** - Full CRUD operations for income and expenses
- 🗂️ **Custom Categories** - Create, edit, and delete categories with custom icons and colors
- 📊 **Budget Planning** - Set monthly budgets and track progress by category
- 📈 **Advanced Analytics** - Spending trends, category breakdowns, and financial insights
- 🔍 **Search & Filter** - Advanced filtering with pagination and sorting
- 📱 **RESTful API** - Clean, consistent, and well-documented API endpoints

### Technical Features
- ✅ **TypeScript** - Type-safe code for better reliability
- 🚀 **High Performance** - Optimized database queries with indexes
- 🔒 **Security First** - Helmet.js, CORS, rate limiting, and input sanitization
- 🐳 **Docker Support** - Containerized application for easy deployment
- 📝 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🧪 **Testing Ready** - Jest and Supertest setup included
- 📦 **Bulk Operations** - Import/export transactions in CSV/JSON format

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Docker
- MongoDB 6+ (or MongoDB Atlas account)
- npm or yarn package manager

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/budget-tracker-api.git
cd budget-tracker-api

# Copy environment variables
cp .env.example .env

# Start the application
docker-compose up -d

# Seed the database with sample data
docker exec -it budget-tracker-backend npm run seed
