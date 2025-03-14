const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const videoSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const Video = mongoose.model('Video', videoSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'videos/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const newVideo = new Video({ filename: req.file.originalname });
        await newVideo.save();

        console.log("File uploaded", req.file);
        res.status(200).json({ message: 'Video uploaded successfully!' });
    } catch (error) {
        console.error("Error uploading video and saving metadata:", error);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

app.get('/videos', async (req, res) => {
    try {
        const videos = await Video.find().sort({ uploadDate: -1 });
        const videoFiles = videos.map(video => video.filename);
        res.json(videoFiles);
    } catch (error) {
        console.error("Error fetching videos from MongoDB:", error);
        return res.status(500).json({ error: "Failed to read video files" });
    }
});

app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
});
app.get("/", (req, res) => {
    res.send("Server is running!");
});
const videoDirectory = path.join(__dirname, 'videos');
console.log("videoDirectory",videoDirectory)
fs.mkdirSync(videoDirectory, { recursive: true });



