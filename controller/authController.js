const User = require('../models/userModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// user login   
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid password" });
            
        }

        const userDetails = await User.findOne({ email });

        // Generate JWT token
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful', data: {
                token,
                user: userDetails,
                success: true
            }
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ err: err.message, });
    }
}

// signup user
exports.signup = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        // Check if all required fields are provided
        if (!username || !email || !password || !name) {
            return res.status(500).json(
                { error: "All fields (username, email, password, name) are required" }
            );
        }

        // Check if password length is at least 6 characters
        if (password.length < 6) {
            return res.status(500).json(
                { error: "Password must be at least 6 characters long" }
            );
        }
        const userExists = await User.findOne({ email });
        const usernameExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (usernameExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            name,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        console.log(savedUser);

        res.status(200).json({ success: true, message: 'User created successfully', data: savedUser, });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
}

// signout user

exports.signout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({ message: 'Signout successful' });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
}
