const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Use the middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Set up CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const corsOptions = {
    origin: 'https://dgtl-frontend.vercel.app/', // allow only the specified domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.use(cors(corsOptions));
const port = process.env.PORT || 5000;

//import mongourl from .env file


const url = process.env.MONGODB_URI ;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB database connected");
});

// Define routes after the middleware
const Schema = mongoose.Schema;
const employeeSchema = new Schema({
    name: String,
    from: String,
    position: String
});

const Employee = mongoose.model("Employee", employeeSchema);

// POST route to add a new employee
app.post('/add/employee', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).send({ message: 'Employee added successfully', data: newEmployee });
    } catch (error) {
        res.status(400).send({ message: 'Error adding employee', error: error.message });
    }
});

// GET route to get all employees
app.get('/employee', async (req, res) => {
    try {
        const { query } = req.query;
        const items = await Employee.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { from: { $regex: query, $options: 'i' } },
                { position: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});