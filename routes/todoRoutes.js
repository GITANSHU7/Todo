const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const todoController = require('../controller/todoController');
const isAuthenticated = require('../middleware/middleware');

// GET /todos: Fetch all todo items.
// GET /todos/:id: Fetch a single todo item by ID.
// POST /todos: Add a new todo item.
// PUT /todos/:id: Update an existing todo item.
// DELETE /todos/:id: Delete a todo item.
// POST /todos/upload: Upload todo items from a CSV file.
// GET /todos/download: Download the todo list in CSV format.
// GET /todos/filter?status=:status: Filter todo list items based on status.

router.get('/', isAuthenticated, todoController.todoList);
router.get('/:id', isAuthenticated, todoController.getTodoById);
router.post('/', isAuthenticated, todoController.addTodo);
router.put('/:id', isAuthenticated, todoController.editTodo);
router.delete('/:id', isAuthenticated, todoController.deleteTodo);
router.post('/upload',isAuthenticated, upload.single('file'), todoController.uploadTodosFromCSV);
router.get('/download', isAuthenticated, todoController.downloadTodosAsCSV);
router.get('/filter', isAuthenticated, todoController.filterTodos);


module.exports = router;

