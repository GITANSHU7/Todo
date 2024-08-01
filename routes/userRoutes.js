const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const isAuthenticated = require('../middleware/middleware');

router.post('/create',isAuthenticated,  userController.createUser);
router.post('/list',isAuthenticated,  userController.getUsers);
router.delete('/delete/:id',isAuthenticated,  userController.deleteUser);
router.put('/update/:id',isAuthenticated,  userController.updateUser);
router.get('/get/:id',isAuthenticated,  userController.getUserById);


module.exports = router;