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
