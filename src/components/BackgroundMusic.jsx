import React, { useState, useEffect, useRef } from 'react';
import bgmFile from '../assets/still_here.mp3';

const BackgroundMusic = () => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Attempt auto-play on mount (might be blocked by browser policy)
        if (audioRef.current) {
            audioRef.current.volume = 0.4;
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.log("Auto-play blocked, waiting for interaction", err));
        }
    }, []);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            <audio ref={audioRef} src={bgmFile} loop />
            <button
                onClick={togglePlay}
                style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid white',
                    color: 'white',
                    borderRadius: '50%',
                    width: '60px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {isPlaying ? '~♪' : 'Mute'}
            </button>
        </div>
    );
};

export default BackgroundMusic;
