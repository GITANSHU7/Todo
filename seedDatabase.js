const mongoose = require('mongoose');
const User = require('./models/userModels');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    await mongoose.connect('mongodb+srv://gitanshugautam7:2v8j0fT7WMKUgD8G@cluster0.reasy5s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    const userPassword = '12345678';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);


    const superadmin = new User({
        username: 'admin',
        name: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword
    });

    const user = new User({
        username: 'user',
        name: 'user',
        email: 'user@gmail.com',
        password: hashedPassword
    });

    await superadmin.save();
    await user.save();

    console.log('Database seeded!');
    process.exit();
};

seedDatabase().catch(err => console.error(err));
