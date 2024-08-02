const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const todoController = require('../controller/todoController');
const isAuthenticated = require('../middleware/middleware');

router.post('/upload',isAuthenticated, upload.single('file'), todoController.uploadTodosFromCSV);
router.get('/download', isAuthenticated, todoController.downloadTodosAsCSV);

router.get('/', isAuthenticated, todoController.todoList);
router.get('/:id', isAuthenticated, todoController.getTodoById);
router.post('/', isAuthenticated, todoController.addTodo);
router.put('/:id', isAuthenticated, todoController.editTodo);
router.delete('/:id', isAuthenticated, todoController.deleteTodo);


module.exports = router;

