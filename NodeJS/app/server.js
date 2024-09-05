const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const nodemailer = require('nodemailer'); // For sending emails
const crypto = require('crypto'); // For generating tokens
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri);

async function connectToMongo() {
 try {
     await client.connect(); // Connect to MongoDB
     console.log('Connected to MongoDB');
 } catch (error) {
     console.error('Error connecting to MongoDB:', error);
 }
}

connectToMongo();
const db = client.db('MANGODB');

const router = require('./routers.js');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Load static assets
app.use('/static', express.static(path.join(__dirname, 'views')));
app.use('/assets', express.static(path.join(__dirname, 'views/public/assets')));

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));
app.use('/api', router); // Use the router for API routes

// Nodemailer setup for sending reset emails
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or any other email service
    auth: {
        user: 'your-email@gmail.com', // Your email
        pass: 'your-email-password' // Your email password
    }
});

// Route for handling user signup
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return res.status(400).send('User with this email already exists');
    }

    // Create a new user document
    const newUser = { email, password };
    await db.collection('users').insertOne(newUser);
    res.render('login', { title: 'Login System' });
});

// Home route
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login System' });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup System' });
});

// Forget Password Route
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const user = await db.collection('users').findOne({ email });
    if (!user) {
        return res.status(400).send('User with this email does not exist');
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store token in the database with an expiration time
    const tokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
    await db.collection('users').updateOne({ email }, { $set: { resetToken, tokenExpiry } });

    // Create a reset link
    const resetLink = `http://localhost:${port}/reset-password/${resetToken}`;

    // Send reset email
    await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        text: `Please click the following link to reset your password: ${resetLink}`
    });

    res.send('Password reset link has been sent to your email.');
});

// Reset Password Route (GET - Render Form)
app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    // Find user with the reset token
    const user = await db.collection('users').findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired.');
    }

    // Render reset password form
    res.render('reset-password', { title: 'Reset Password', token });
});

// Reset Password Route (POST - Update Password)
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Find user with the reset token
    const user = await db.collection('users').findOne({ resetToken: token, tokenExpiry: { $gt: Date.now() } });
    if (!user) {
        return res.status(400).send('Password reset token is invalid or has expired.');
    }

    // Update password and clear reset token
    await db.collection('users').updateOne({ resetToken: token }, { $set: { password }, $unset: { resetToken: '', tokenExpiry: '' } });

    res.send('Password has been successfully reset.');
});

// Dashboard Route
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.send('Unauthorized User');
    }
});

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});

