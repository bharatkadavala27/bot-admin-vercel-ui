# B.O.T HRMS API Documentation

**Base URL**: `https://bot-admin-t4uf.onrender.com/api`

## Authentication
Most routes require a Bearer Token in the headers:
`Authorization: Bearer <your_token>`

---

## 1. Users & Auth (`/users`)

### Login Request
- **Method**: `POST`
- **Endpoint**: `/users/login-request`
- **Body**: `{ "phoneNumber": "1234567890" }`

### Verify OTP
- **Method**: `POST`
- **Endpoint**: `/users/verify-otp`
- **Body**: `{ "phoneNumber": "1234567890", "otp": "123456" }`

### Get Profile
- **Method**: `GET`
- **Endpoint**: `/users/profile`

---

## 2. Attendance (`/attendance`)

### Punch In
- **Method**: `POST`
- **Endpoint**: `/attendance/punch-in`
- **Body**: 
  ```json
  {
    "branchId": "ID",
    "location": { "lat": 0, "lng": 0 }
  }
  ```

### Punch Out
- **Method**: `POST`
- **Endpoint**: `/attendance/punch-out`

### Lunch In/Out
- **Method**: `POST`
- **Endpoint**: `/attendance/lunch-in` (or `/lunch-out`)

---

## 3. Management

### Branches
- **Method**: `GET`
- **Endpoint**: `/branches`

### Dashboard Stats
- **Method**: `GET`
- **Endpoint**: `/dashboard/summary`

### Employees (Admin Only)
- **Method**: `GET` | `POST` | `PUT` | `DELETE`
- **Endpoint**: `/users/employees`

---

## 4. Operational Routes

| Category | Base Path | Actions |
| :--- | :--- | :--- |
| Salaries | `/salary` | `GET /` |
| Tickets | `/tickets` | `GET /`, `POST /` |
| Expenses | `/expenses` | `GET /`, `POST /` |
| Announcements| `/announcements` | `GET /` |
| Assets | `/assets` | `GET /` |
| Leaves | `/leave-types` | `GET /` |
