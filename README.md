# Todo Backend API

This backend provides a simple task API using Express and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   cd Backend
   npm install
   ```
2. Create a `.env` file from `.env.example` and set your MongoDB URI, or use the provided `Backend/.env` for local MongoDB.
3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /api/tasks` - list all tasks
- `POST /api/tasks` - add a task
- `PUT /api/tasks/:id` - update a task
- `DELETE /api/tasks/:id` - delete a task

## Task payload example

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```
