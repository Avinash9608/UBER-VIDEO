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

### Get User Profile Endpoint

**URL:** `/api/users/profile`  
**Method:** `GET`  
**Content-Type:** `application/json`

**Description:**  
Retrieves the profile details of the authenticated user. This endpoint requires a valid JWT token. The token can be provided via a cookie (`token`) or in the request header (`Authorization: Bearer JWT_TOKEN`).

**Authentication:**  
Requires a valid JWT token verified by middleware (`authMiddleware.authUser`).

**Example Request:**

```http
GET /api/users/profile HTTP/1.1
Host: your-domain.com
Authorization: Bearer JWT_TOKEN_HERE

Sucess Response
Status: 200 OK
{
  "user": {
    "_id": "USER_ID_HERE",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
    // additional non-sensitive fields as applicable
  }
}
Error Response:

If the user is not found or the token is invalid/expired:
Status: 404 Not Found
{
  "message": "User not found"
}
Logout User Endpoint
URL: /api/users/logout
Method: GET
Content-Type: application/json

Description:
Logs out the authenticated user by clearing the authentication cookie (token) and blacklisting the provided token. This prevents the token from being used again for subsequent API requests.
Description:
Logs out the authenticated user by clearing the authentication cookie (token) and blacklisting the provided token. This prevents the token from being used again for subsequent API requests.

Authentication:
Requires a valid JWT token verified by middleware (authMiddleware.authUser).

Mechanism:

The token is extracted either from the cookies or the Authorization header.
The token is added to a blacklist (handled by blacklistTokenModel) to prevent reuse.
The authentication cookie is cleared.
Example Request:
GET /api/users/logout HTTP/1.1
Host: your-domain.com
Authorization: Bearer JWT_TOKEN_HERE
Error Handling:

In case of token or logout errors, an appropriate error message and status code will be returned.
```

### Register Captain Endpoint

**URL:** `/api/captains/register`  
**Method:** `POST`  
**Content-Type:** `application/json`

**Description:**  
Registers a new captain in the system. The endpoint validates the input data, hashes the provided password, creates a new captain record in the database including vehicle details, and returns a JWT token for authentication.

**Validation Rules:**

- **fullname.firstname:**
  - Type: String
  - Required: Yes
  - Minimum Length: 3 characters
- **fullname.lastname:**
  - Type: String
  - Required: Yes
  - Minimum Length: 3 characters
- **email:**
  - Type: String
  - Required: Yes
  - Format: Must be a valid email address
- **password:**
  - Type: String
  - Required: Yes
  - Minimum Length: 6 characters
- **vehicle.color:**
  - Type: String
  - Required: Yes
- **vehicle.plate:**
  - Type: String
  - Required: Yes
- **vehicle.capacity:**
  - Type: Number
  - Required: Yes
- **vehicle.vehicleType:**
  - Type: String
  - Required: Yes

**Example Request:**

```json
POST /api/captains/register
Content-Type: application/json

{
  "fullname": {
    "firstname": "Jane",
    "lastname": "Doe"
  },
  "email": "jane.doe@example.com",
  "password": "strongPassword123",
  "vehicle": {
    "color": "Red",
    "plate": "XYZ123",
    "capacity": 4,
    "vehicleType": "Sedan"
  }
}

Success Response:

On successful registration, the server responds with a status code of 201 and returns a message along with a JWT token.

Status: 201 Created
{
  "message": "Captain registered successfully",
  "token": "JWT_TOKEN_HERE"
}

Error Responses
If the input data fails validation, the response will include errors from express-validator.
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
Captain Already Exists:
If a captain with the provided email already exists:

Status: 400 Bad Request
{
  "message": "Captain already exists"
}
Flow Overview:

Input Validation:
The endpoint uses express-validator to ensure that all fields in the request body adhere to the specified formats and constraints.

Duplicate Check:
The controller checks if a captain already exists using the provided email. If so, it returns a 400 error.

Password Hashing:
The plain text password is hashed using CaptainModel.hashPassword to ensure secure storage.

Captain Creation:

The service layer (captainService.createCaptain) verifies that all required fields are present.
It creates a new record with the captain's profile and embedded vehicle details.
Token Generation:
Once created, the captain document invokes the instance method generateAuthToken to generate a JWT for further authentication.

Response:
The endpoint responds with a 201 Created status, returning a success message and the generated token.

Files Involved:

Controller (captain.controller.js):
Handles validation, duplicate checking, password hashing, invoking the service to create the captain, and generating the JWT token.

Service (captain.service.js):
Contains the business logic for creating a new captain. It validates that all fields (captain details and vehicle details) are provided, and then creates the record in the database.

This endpoint ensures secure registration of captains with complete vehicle details, making use of layered validation and business logic.
```
