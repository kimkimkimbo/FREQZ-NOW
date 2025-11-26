import React, { useRef, useEffect, useState } from 'react';
import { applyVintageFilter } from './FilterEngine';
import cameraOverlay from '../assets/c_img.png';

const CameraScreen = ({ onCaptureComplete }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [isFlashing, setIsFlashing] = useState(false);

    // Start Webcam
    useEffect(() => {
        // 모바일 대응을 위해 facingMode: 'user' (전면 카메라) 추가 권장
        navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 }, // 해상도를 조금 높임
                height: { ideal: 720 },
                facingMode: 'user'
            }
        })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            })
            .catch(err => console.error("Error accessing webcam:", err));
    }, []);

    // Real-time Filter Loop
    useEffect(() => {
        let animationFrameId;

        const render = () => {
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
                const ctx = canvasRef.current.getContext('2d');
                const width = canvasRef.current.width;
                const height = canvasRef.current.height;

                // 거울 모드 (좌우 반전) - 셀카 찍을 때 자연스럽게
                ctx.save();
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, -width, 0, width, height);
                ctx.restore();

                // Apply Filter
                applyVintageFilter(ctx, width, height);
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const takePhoto = () => {
        if (photos.length >= 4) return;

        let count = 3;
        setCountdown(count);

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(timer);
                setCountdown(null);
                captureFrame();
            }
        }, 1000);
    };

    const captureFrame = () => {
        if (canvasRef.current) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 150);

            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            const newPhotos = [...photos, dataUrl];
            setPhotos(newPhotos);

            if (newPhotos.length === 4) {
                setTimeout(() => onCaptureComplete(newPhotos), 500);
            }
        }
    };

    return (
        <div className="camera-screen" style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // 화면 세로 중앙 정렬
            backgroundColor: 'var(--color-bg-main)', // 배경색 확보
            overflow: 'hidden'
        }}>

            {/* --- [1] 카메라 프레임 컨테이너 --- */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px', // [수정 포인트] 이미지 최대 크기 (모바일에서는 화면 꽉 참)
                padding: '20px', // 좌우 여백 확보
                boxSizing: 'border-box'
            }}>

                {/* A. 프레임 이미지 (가장 앞쪽) */}
                <img
                    src={cameraOverlay}
                    alt="Camera Frame"
                    style={{
                        position: 'relative',
                        zIndex: 20, // 비디오보다 위에 있어야 함 (투명한 부분으로 비디오가 보임)
                        width: '100%', // 부모 컨테이너에 맞춤
                        display: 'block',
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.3))' // 약간의 그림자로 입체감
                    }}
                />

                {/* B. 비디오 화면 (이미지 뒤쪽 혹은 구멍 위치) */}
                <div style={{
                    position: 'absolute',
                    zIndex: 10, // 이미지보다 뒤에 위치
                    backgroundColor: '#000',
                    overflow: 'hidden',

                    // ▼▼▼▼▼ [위치 및 크기 미세 조정 구역] ▼▼▼▼▼
                    // c_img.png의 투명한 화면 영역에 맞춰서 아래 % 숫자를 조정하세요.

                    top: '28%',      // [수정] 이미지 상단에서 얼마나 내려올지 (예: 25% ~ 30%)
                    left: '17%',     // [수정] 이미지 왼쪽에서 얼마나 떨어질지 (예: 10% ~ 15%)
                    width: '47%',    // [수정] 화면 영역의 가로 너비 (예: 70% ~ 80%)
                    height: '54%',   // [수정] 화면 영역의 세로 높이 (예: 40% ~ 50%)

                    // ▲▲▲▲▲ [조정 끝] ▲▲▲▲▲

                    borderRadius: '4px', // 화면 모서리가 둥글다면 추가
                }}>
                    <video ref={videoRef} style={{ display: 'none' }} />
                    <canvas ref={canvasRef} width={640} height={480} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* 카운트다운 */}
                    {countdown && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            fontSize: '4rem', color: '#fff', textShadow: '0px 2px 10px rgba(0,0,0,0.5)',
                            fontWeight: '900', zIndex: 30
                        }}>
                            {countdown}
                        </div>
                    )}

                    {/* 플래시 효과 */}
                    {isFlashing && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'white', opacity: 0.9, zIndex: 31
                        }} />
                    )}
                </div>
            </div>

            {/* --- [2] 컨트롤 영역 (스냅 버튼 & 카운터) --- */}
            <div style={{
                marginTop: '30px', // 카메라 이미지와 버튼 사이 간격
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                zIndex: 30
            }}>
                {/* 귀여운 스냅 버튼 디자인 */}
                <button
                    onClick={takePhoto}
                    disabled={photos.length >= 4 || countdown !== null}
                    style={{
                        backgroundColor: 'var(--color-frame-text)',
                        padding: '10px 25px',
                        fontSize: '1.5rem',
                        color: 'var(--color-bg-main)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px',
                        transition: 'transform 0.1s, opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                    onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >

                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-bg-main)' }}>SNAP</span>

                </button>

                <div style={{
                    color: 'var(--color-text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    opacity: 0.8,
                    letterSpacing: '2px'
                }}>
                    {photos.length} / 4
                </div>
            </div>
        </div>
    );
};

export default CameraScreen;