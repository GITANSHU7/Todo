const User = require('../models/userModels');

// create user

exports.createUser = async (req, res) => {
    try {
        const { name, email,  username } = req.body;
        const newUser = new User({ name, email,  username });
        // check if user already exists
        const userExists = await User.findOne({ email });
        const usernameExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        // Handle validation or other errors
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}


// get all users with pagination

exports.getUsers = async (req, res) => {

    try {

        const page = parseInt(req.query.page);
        const per_page_record = parseInt(req.query.per_page_record);

        let users;
        let total;

        if (page && per_page_record) {
            const pageInt = parseInt(page);
            const perPageRecordInt = parseInt(per_page_record);
            const startIndex = (pageInt - 1) * perPageRecordInt;
            total = await User.countDocuments();
            users = await User.find()
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(startIndex)
                .limit(perPageRecordInt);
        } else {
            users = await User.find().select("-password").sort({ createdAt: -1 });
            total = users.length;
        }

        return res.json({
            message: "User list retrieved successfully",
            data: users,
            total: total,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}

// delete user by id

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (err) {
        console.log(err);
    }
}

// update user by id

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, username } = req.body;

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user information only if different from current values
        let isUpdated = false;
        if (name && name !== user.name) {
            user.name = name;
            isUpdated = true;
        }
        if (email && email !== user.email) {
            user.email = email;
            isUpdated = true;
        }
        if (username && username !== user.username) {
            user.username = username;
            isUpdated = true;
        }
       

        // Save the updated user information only if there were changes
        if (isUpdated) {
            const savedUser = await user.save();
            return res.json({
                message: "User updated successfully",
                success: true,
                data: savedUser,
            });
        } else {
            return res.json({
                message: "No changes detected",
                success: true,
            });
        }
    } catch (error) {
        // Handle other errors and return an error response
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
// get user by id

exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            data: user,
            message: 'User found successfully'
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });

    }
}
