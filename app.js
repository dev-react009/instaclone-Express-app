require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Post = require('./model/post');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const photo = path.join(__dirname, 'upload');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(photo));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload');
    },
    filename: function (req, file, cb) {
        const fileNameArr = file.originalname.split('.');
        cb(null, file.fieldname + '-' + Date.now() + '.' + fileNameArr[fileNameArr.length - 1]);
    }
});

const upload = multer({ storage: storage });

async function connectDB() {
    const URI = process.env.MONGO_URI;
    try {
        const connection = await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
        return connection;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
}

async function main() {
    await connectDB();

    app.get('/', function (req, res) {
        res.send({ message: 'Welcome to instaclone' });
    });

    app.get('/api/get/post', async function (req, res) {
        const posts = await Post.find();
        res.send(posts);
    });

    app.post('/api/add/post', upload.single('image'), async function (req, res) {
        const { author, location, description,date} = req.body;
        const image = req.file.filename;

        const post = new Post({
            author: author,
            location: location,
            description: description,
            image: image,
            date: date  
        });

        try {
            const savedValue = await post.save();
            res.json(savedValue);
        } catch (error) {
            res.json({ message: error.message });
        }
    });

    // Serve the React app for all routes not handled by the API
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });

    app.listen(process.env.PORT || 8083, () => console.log(`Server running on http://localhost:8083`));
}

main();
