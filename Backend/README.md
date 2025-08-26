# Uber-Video Backend

This backend provides user registration and authentication APIs for the Uber-Video application.

## Install Dependencies

```sh
npm install
```

## Start the Server

```sh
node server.js
```

## API Endpoints

### Register User

**Endpoint:**  
`POST /api/users/register`

**Description:**  
Registers a new user.

**Request Body:**

| Field              | Type   | Required | Description                        |
| ------------------ | ------ | -------- | ---------------------------------- |
| fullname.firstname | String | Yes      | User's first name (min 3 chars)    |
| fullname.lastname  | String | Yes      | User's last name (min 3 chars)     |
| email              | String | Yes      | User's email (must be valid email) |
| password           | String | Yes      | Password (min 6 chars)             |

**Example Request:**

```json
POST /api/users/register
Content-Type: application/json

{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response:**

```json
Status: 201 Created
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "_id": "USER_ID_HERE",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

**Validation Errors:**

```json
Status: 400 Bad Request
{
  "errors": [
    {
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

## Project Structure

- [`Backend/app.js`](Backend/app.js): Express app setup
- [`Backend/server.js`](Backend/server.js): Server entry point
- [`Backend/routes/user.routes.js`](Backend/routes/user.routes.js): User routes
- [`Backend/controllers/user.controller.js`](Backend/controllers/user.controller.js): User controller logic
- [`Backend/services/user.service.js`](Backend/services/user.service.js): User service logic
- [`Backend/models/user.model.js`](Backend/models/user.model.js): User Mongoose model
- [`Backend/db/db.js`](Backend/db/db.js): MongoDB connection

## Notes

- Passwords are hashed before storing in the database.
- JWT tokens are generated upon successful registration.
- All fields are required for registration.

---

For more details, see the code in [Backend/routes/user.routes.js](Backend/routes/user.routes.js), [Backend/controllers/user.controller.js](Backend/controllers/user.controller.js), and [Backend/models/user.model.js](Backend/models/user.model

# User Logic Documentation

This document explains the internal logic behind user management in the Uber-Video backend. The functionality includes registration, authentication, password hashing, and token generation. The logic is distributed into different layers: routes, controllers, services, and models.

## 1. API Routes

- **File:** `Backend/routes/user.routes.js`
- **Responsibilities:**
  - Define endpoints for user-related operations.
  - Use middleware (from `express-validator`) to validate incoming data.
  - Forward valid requests to the appropriate controller functions.

**Example:**  
For user registration, the route verifies:

- Email format (`isEmail`)
- Minimum length for `fullname.firstname` (min 3 characters)
- Minimum length for `password` (min 6 characters)

After validation, the request is passed to the `registerUser` controller.

## 2. User Controller

- **File:** `Backend/controllers/user.controller.js`
- **Responsibilities:**
  - Process validated data from requests.
  - Handle error responses if validations fail.
  - Interact with the service layer to execute the business logic.
  - Generate a JWT token post user creation or login.
  - Send appropriate HTTP responses.

**User Registration Flow:**

1. **Validation:**  
   Uses `validationResult` from `express-validator` to check for any errors from the middleware validations.
2. **Password Hashing:**  
   Calls a static method on the User model (`hashPassword`) to securely hash the provided password.
3. **User Creation:**  
   Delegates user creation to the service layer by passing:
   - First name and last name (from `fullname`)
   - Email
   - Hashed password
4. **Token Generation:**  
   Once the user is created, it calls an instance method (`generateAuthToken`) on the user document to create a JWT token.
5. **Response:**  
   Returns a JSON response containing a success message, the user’s data (excluding sensitive fields), and the generated token.

## 3. User Service

- **File:** `Backend/services/user.service.js`
- **Responsibilities:**
  - Handle business logic related to user creation.
  - Ensure all required fields (firstname, lastname, email, password) are provided.
  - Interface with the Mongoose model layer for database operations (create the user document).

**Key Logic Points:**

- The function checks for the presence of all required fields.
- Calls `userModel.create()` to add a new user to the database.
- Returns the user document to the controller for further processing.

## 4. User Model

- **File:** `Backend/models/user.model.js`
- **Responsibilities:**
  - Define the schema for user data using Mongoose.
  - Specify field validations (e.g., minimum length).
  - Implement methods for authentication and security:
    - **Password Comparison:**  
      A method `comparePassword` compares a plain text password with the hashed version stored in the database.
    - **Password Hashing:**  
      A static method `hashPassword` to hash passwords using bcrypt.
    - **JWT Token Generation:**  
      An instance method `generateAuthToken` that creates a JWT token based on the user’s `_id`.

**Security Considerations:**

- The password is stored with the `select: false` option to avoid sending it in queries by default.
- Password hashing ensures that plain text passwords are not stored in the database.
- JWT is created using a secret from the environment configuration to secure token generation.

## Flow Summary

1. **Incoming Request:**  
   A client submits a registration request to `/api/users/register`.
2. **Validation:**  
   The route uses `express-validator` to ensure data is in the correct format.
3. **Controller Processing:**  
   The controller processes the request:
   - Uses `userModel.hashPassword` for securing the password.
   - Calls `userService.createUser` to insert the user into the database.
   - Generates a JWT token with `user.generateAuthToken`.
4. **Response:**  
   The controller sends a JSON response containing the user data and the token back to the client.

This modular approach ensures separation of concerns:

- Routes manage HTTP interactions.
- Controllers handle processing and responses.
- Services encapsulate business logic.
- Models ensure proper data management and security.

---

For more details, refer to the individual files
