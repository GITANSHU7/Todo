const Todo = require('../models/todoModels');
const fs = require('fs');
const csv = require('csv-parser');
// add todo
exports.addTodo = async (req, res) => {
    try {
        const { description, status } = req.body;

        if (!req.body) {
            return res.status(400).json({ error: "All fields is required" });
        }

        // duplicate check
        const todoExists = await Todo.findOne({ description });
        if (todoExists) {
            return res.status(400).json({ error: "Todo already exists" });
        }

        const todo = new Todo({
            description,
            status,
            createdBy: req.user.id
        });

        await todo.save();
        res.json({ message: 'Todo added successfully', data: todo });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: err.message });
    }
}
// todo list
exports.todoList = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page);
        const per_page_record = parseInt(req.query.per_page_record);

        let todos;
        let total;

        if (page && per_page_record) {
            const pageInt = parseInt(page);
            const perPageRecordInt = parseInt(per_page_record);
            const startIndex = (pageInt - 1) * perPageRecordInt;
            total = await Todo.countDocuments({ createdBy: userId });;
            todos = await Todo.find({ createdBy: userId })
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(perPageRecordInt);
        } else {
            todos = await Todo.find({ createdBy: userId }).sort({ createdAt: -1 });
            total = todos.length;
        }

        const todosWithCounts = todos.map(todo => ({
            ...todo._doc
          }));

        return res.json({
            message: "Todo list retrieved successfully",
            data: todosWithCounts,
            total: total,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// edit todo
exports.editTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        // req body
        const {  description, status } = req.body;
        

        // Update todo fields only if different from existing
        let isUpdated = false;
        
        if (description && description !== todo.description) {
            todo.description = description;
            isUpdated = true;
        }
        if (status && status !== todo.status) {
            todo.status = status;
            isUpdated = true;
        }
       

        if (isUpdated) {
            const saveTodos = await todo.save();
            return res.json({
                message: "Todo updated successfully",
                success: true,
                data: saveTodos,
            });
        } else {
            return res.json({
                message: "No changes detected",
                success: true,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

// get todo by id
exports.getTodoById = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }
        
        return res.json({ message: "Todo retrieved successfully", data: todo });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// delete todo
exports.deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }
        await todo.remove();
        return res.json({ message: "Todo deleted successfully", success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// upload csv
exports.uploadTodosFromCSV = async (req, res) => {
    const results = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                await Todo.insertMany(results);
                res.status(201).json({ message: 'Todos successfully uploaded' });
            } catch (error) {
                res.status(500).json({ error: 'Error uploading todos' });
            }
        });
};

// download csv
exports.downloadTodosAsCSV = async (req, res) => {
    try {
        const todos = await Todo.find();
        const fields = ['description', 'status'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(todos);

        res.header('Content-Type', 'text/csv');
        res.attachment('todos.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: 'Error generating CSV' });
    }
};

// filter todo
// exports.filterTodos = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const status = req.query.status;
//         const page = parseInt(req.query.page) || 1;
//         const per_page_record = parseInt(req.query.per_page_record) || 10;

//         let todos;
//         let total;
//         const query = {};

//         if (status) {
//             query.status = status;
//         }

//         const pageInt = parseInt(page);
//         const perPageRecordInt = parseInt(per_page_record);
//         const startIndex = (pageInt - 1) * perPageRecordInt;
//         total = await Todo.countDocuments(query).where({ createdBy: userId });
//         todos = await Todo.find(query).where({ createdBy: userId })
//             .sort({ createdAt: -1 })
//             .skip(startIndex)
//             .limit(perPageRecordInt);

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             total: total,
//             success: true,
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// }

// exports.filterTodos = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const status = req.query.status;
//         const page = parseInt(req.query.page) || 1;
//         const per_page_record = parseInt(req.query.per_page_record) || 10;

//         let todos;
//         let total;
//         const query = { createdBy: userId };

//         if (status) {
//             query.status = status;
//         }

//         const startIndex = (page - 1) * per_page_record;
//         total = await Todo.countDocuments(query);
//         todos = await Todo.find(query)
//             .sort({ createdAt: -1 })
//             .skip(startIndex)
//             .limit(per_page_record);

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             total: total,
//             success: true,
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// }

// exports.filterTodos = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const status = req.query.status;
//         const page = parseInt(req.query.page) || 1;
//         const perPageRecord = parseInt(req.query.per_page_record) || 10;

//         // Validate ObjectId
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ error: 'Invalid user ID' });
//         }

//         let query = { createdBy: userId };

//         if (status) {
//             query.status = status;
//         }

//         console.log('Query:', query);

//         const startIndex = (page - 1) * perPageRecord;
//         const total = await Todo.countDocuments(query);
//         const todos = await Todo.find(query)
//             .sort({ createdAt: -1 })
//             .skip(startIndex)
//             .limit(perPageRecord);

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             total: total,
//             success: true,
//         });
//     } catch (error) {
//         console.error('Error fetching todos:', error);
//         return res.status(500).json({ error: error.message });
//     }
// }


// exports.filterTodos = async (req, res) => {
//     try {
//         const status = req.query.status; // Get the status from query parameters

//         // Validate the status parameter
//         if (!['pending', 'completed'].includes(status)) {
//             return res.status(400).json({ message: 'Invalid status value' });
//         }

//         // Query the database
//         const todos = await Todo.find({ status: status });

//         // Send the response
//         res.status(200).json(todos);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error });
//     }
// }

// write a function to filter todos based on status
// exports.filterTodos = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const status = req.query.status;
//         const page = parseInt(req.query.page) || 1;
//         const perPageRecord = parseInt(req.query.per_page_record) || 10;

//         // Validate ObjectId
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ error: 'Invalid user ID' });
//         }

//         let query = { createdBy: userId };

//         if (status) {
//             query.status = status;
//         }

//         const startIndex = (page - 1) * perPageRecord;
//         const total = await Todo.countDocuments(query);
//         const todos = await Todo.find(query)
//             .sort({ createdAt: -1 })
//             .skip(startIndex)
//             .limit(perPageRecord);

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             total: total,
//             success: true,
//         });
//     } catch (error) {
//         console.error('Error fetching todos:', error);
//         return res.status(500).json({ error: error.message });

//     }
// }

// exports.filterTodos = async (req, res) => {
//     try {
//         // const userId = req.user.id;
//         const status = req.query.status;
//         const page = parseInt(req.query.page) || 1;
//         const per_page_record = parseInt(req.query.per_page_record) || 10;

//         if (isNaN(page) || isNaN(per_page_record)) {
//             return res.status(400).json({ error: "Invalid pagination parameters" });
//         }

//         let todos;
//         let total;
//         const query = {};

//         if (status) {
//             query.status = status;
//         }

//         const pageInt = parseInt(page);
//         const perPageRecordInt = parseInt(per_page_record);
//         const startIndex = (pageInt - 1) * perPageRecordInt;
//         total = await Todo.countDocuments(query).where({ createdBy: userId });
//         todos = await Todo.find(query).where({ createdBy: userId })
//             .sort({ createdAt: -1 })
//             .skip(startIndex)
//             .limit(perPageRecordInt);

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             total: total,
//             success: true,
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// }

// exports.filterTodos = async (req, res) => {
//     try {
       
//         const status = req.query.status;

//         let todos;
       

//         if (status) {
//             query.status = status;
//         }

//         todos = await Todo.find(query).sort({ createdAt: -1 });

//         const todosWithCounts = todos.map(todo => ({
//             ...todo._doc
//         }));

//         return res.json({
//             message: "Filtered todo list retrieved successfully",
//             data: todosWithCounts,
//             success: true,
//         });
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// }

exports.filterTodos = async (req, res) => {
    try {
        const status = req.query.status;

        if (!['pending', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const todos = await Todo.find({ status: status });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}