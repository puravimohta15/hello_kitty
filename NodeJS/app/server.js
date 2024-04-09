const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost:27017'; // Connection URI
const client = new MongoClient(uri);
// import router from './routers.js';

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


// Get the database instance

    // Route for handling user signup
    app.post('/api/signup', async (req, res) => {
        const {  email, password } = req.body;
        console.log(email,password)
    
        // Check if user already exists in the database
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).send('User with this email already exists');
        }
    
        // Create a new user document
        const newUser = {  email, password };
        await db.collection('users').insertOne(newUser);
       // res.send('Signup successful'); // Send response to the client
       res.render('login', { title: 'Login System' });
    });
    

// Home route
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login System' });
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup System' });
});

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});
