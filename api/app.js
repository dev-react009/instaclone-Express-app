require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Post = require('./model/post');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload'); // Add this line

const app = express();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use express-fileupload middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    app.post('/api/add/post', async function (req, res) {
        try {
            const { author, location, description, date } = req.body;
            const file = req.files.image; // Accessing the uploaded image file

            if (file) {
                // Upload the image to Cloudinary
                const result = await cloudinary.uploader.upload(file.tempFilePath);
                console.log(result)
                // Create a new post with the uploaded image URL
                const post = new Post({
                    author: author,
                    location: location,
                    description: description,
                    image: result.secure_url, // Use the secure URL from Cloudinary
                    date: date
                });

                // Save the post to MongoDB
                const savedValue = await post.save();
                res.json(savedValue);
            } else {
                res.status(400).send({ message: 'No image file uploaded' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    // Serve the React app for all routes not handled by the API
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });

    app.listen(process.env.PORT || 8083, () => console.log(`Server running on http://localhost:8083`));
}

main();
