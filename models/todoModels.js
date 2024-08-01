const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    
    description: {
        type: String,
        required: true,
        trim: true,
        message: 'Description field is required',
        unique: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },

   
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);