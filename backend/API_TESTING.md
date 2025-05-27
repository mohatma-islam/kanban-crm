# API Testing Guide

This document provides instructions on how to test the API endpoints of the Kanban CRM application.

## Default Admin Credentials

The system comes pre-seeded with an admin user:
- Email: `admin@example.com`
- Password: `password`

## Testing Methods

There are two ways to test the API endpoints:

### 1. Using the Custom Artisan Command

We've created a custom artisan command that tests all major API endpoints using the admin credentials:

```bash
php artisan api:test
```

This command will:
1. Test the public API endpoint
2. Login with admin credentials
3. Test all protected API endpoints
4. Logout the admin user

### 2. Using PHPUnit Tests

We've also created comprehensive feature tests for all API endpoints:

```bash
php artisan test --filter=ApiTest
```

This will run all API tests defined in `tests/Feature/ApiTest.php`.

## Available API Endpoints

### Public Routes
- `POST /api/login` - Login with email and password
- `POST /api/register` - Register a new user

### Protected Routes (Requires Authentication)
- `GET /api/user` - Get authenticated user details
- `GET /api/users` - Get all users
- `POST /api/logout` - Logout the current user

#### Customer Management
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get a specific customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/{id}` - Update a customer
- `DELETE /api/customers/{id}` - Delete a customer

#### Board Management
- `GET /api/boards` - Get all boards
- `GET /api/boards/{id}` - Get a specific board
- `POST /api/boards` - Create a new board
- `PUT /api/boards/{id}` - Update a board
- `DELETE /api/boards/{id}` - Delete a board
- `GET /api/boards/{id}/columns` - Get columns for a board
- `POST /api/boards/{id}/columns` - Add a column to a board
- `PUT /api/boards/{id}/columns/{columnId}` - Update a column
- `DELETE /api/boards/{id}/columns/{columnId}` - Delete a column
- `PUT /api/boards/{id}/columns/reorder` - Reorder columns

#### Task Management
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task
- `PUT /api/tasks/{id}/move` - Move a task to a different column
- `PUT /api/tasks-reorder` - Reorder tasks
- `GET /api/tasks/calendar` - Get calendar view of tasks
- `GET /api/calendar` - Alternative endpoint for calendar view

#### Task Comments
- `GET /api/tasks/{id}/comments` - Get all comments for a task
- `POST /api/tasks/{id}/comments` - Add a comment to a task
- `PUT /api/tasks/{id}/comments/{commentId}` - Update a comment
- `DELETE /api/tasks/{id}/comments/{commentId}` - Delete a comment

## Testing with Postman or Insomnia

You can also use tools like Postman or Insomnia to test the API endpoints:

1. First, make a POST request to `/api/login` with:
   ```json
   {
       "email": "admin@example.com",
       "password": "password"
   }
   ```

2. Extract the token from the response and use it in the Authorization header for subsequent requests:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

3. Test the different endpoints using the appropriate HTTP methods and payloads.

## Troubleshooting

If you encounter any issues:

1. Make sure the database has been migrated and seeded:
   ```bash
   php artisan migrate:fresh --seed
   ```

2. Check that Sanctum is properly configured in your `.env` file:
   ```
   SESSION_DRIVER=cookie
   SANCTUM_STATEFUL_DOMAINS=localhost,localhost:8000,127.0.0.1,127.0.0.1:8000
   ```

3. Ensure the server is running:
   ```bash
   php artisan serve
   ``` 