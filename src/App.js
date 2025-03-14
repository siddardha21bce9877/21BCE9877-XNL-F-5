import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await axios.get('http://localhost:5000/videos');
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, []);

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('video', file);
        setUploading(true);

        try {
            await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const response = await axios.get('http://localhost:5000/videos');
            setVideos(response.data);
            setCurrentVideoIndex(0);
            alert('Video uploaded successfully!');

        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video.');
        } finally {
            setUploading(false);
        }
    };

    const handleWheel = (event) => {
        const delta = Math.sign(event.deltaY);

        if (delta > 0) {
            nextVideo();
        } else {
            previousVideo();
        }
    };

    const nextVideo = useCallback(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    }, [videos.length]);

    const previousVideo = useCallback(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    }, [videos.length]);

    useEffect(() => {
        if (videoRef.current && videos.length > 0) {
            videoRef.current.play().catch(error => {
                console.error("Autoplay prevented:", error);
            });
        }
    }, [currentVideoIndex, videos]);

    return (
        <div className="App" onWheel={handleWheel}>
            <h1>Video Sharing Platform</h1>

            <div>
                <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploading} />
                {uploading && <p>Uploading...</p>}
            </div>

            <div className="video-container">
                {videos.length > 0 ? (
                    <video
                        ref={videoRef}
                        src={`http://localhost:5000/videos/${videos[currentVideoIndex]}`}
                        controls
                        muted
                        width="640"
                        height="360"
                        loop
                         preload="auto" // Load the entire video when the page loads
                    />
                ) : (
                    <p>No videos available.</p>
                )}
            </div>
        </div>
    );
};

export default App;