import React, { useRef, useEffect, useState } from 'react';
import { applyVintageFilter } from './FilterEngine'; // FilterEngine이 있다고 가정
import cameraOverlay from '../assets/c_img.png'; // 카메라 이미지 경로

const CameraScreen = ({ onCaptureComplete }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [photos, setPhotos] = useState([]);
    const [countdown, setCountdown] = useState(null);
    const [isFlashing, setIsFlashing] = useState(false);

    // 비디오의 실제 해상도를 저장할 상태 추가
    const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

    // 비디오 메타데이터 로드 완료 시 실행되는 핸들러: 실제 해상도를 가져와 상태 업데이트
    const handleVideoLoaded = () => {
        if (videoRef.current) {
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;
            setVideoDimensions({ width, height });
            console.log(`Video stream loaded: ${width}x${height}`);
        }
    };


    // Start Webcam
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 }, // 고화질 요청
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

                const { width, height } = videoDimensions;

                if (width === 0 || height === 0) {
                    animationFrameId = requestAnimationFrame(render);
                    return;
                }

                // 거울 모드 (좌우 반전)
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
    }, [videoDimensions]);

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

    // 📸 [최종 캡처 로직]: 뷰파인더 비율 그대로 캡처 (여백 없음)
    const captureFrame = () => {
        if (canvasRef.current) {
            setIsFlashing(true);
            setTimeout(() => setIsFlashing(false), 150);

            const { width: streamWidth, height: streamHeight } = videoDimensions;

            // 1. 뷰파인더의 비율 (CSS 기반)
            const CSS_VIEW_WIDTH_PERCENT = 74;
            const CSS_VIEW_HEIGHT_PERCENT = 50;
            const VIEWFINDER_ASPECT = CSS_VIEW_WIDTH_PERCENT / CSS_VIEW_HEIGHT_PERCENT; // 1.48

            // 2. 캡처 해상도를 뷰파인더 비율(1.48)에 맞춰 설정 (여백 없애기)
            const CAPTURE_HEIGHT = 720;
            const CAPTURE_WIDTH = Math.round(CAPTURE_HEIGHT * VIEWFINDER_ASPECT); // 1066px

            const captureCanvas = document.createElement('canvas');
            const captureCtx = captureCanvas.getContext('2d');
            captureCanvas.width = CAPTURE_WIDTH;
            captureCanvas.height = CAPTURE_HEIGHT;

            // 3. 원본 캔버스에서 뷰파인더 비율(1.48)에 해당하는 영역을 추출 (중앙 크롭)
            let sourceX = 0;
            let sourceY = 0;
            let sourceWidth = streamWidth;
            let sourceHeight = streamHeight;

            const streamAspect = streamWidth / streamHeight;

            if (streamAspect > VIEWFINDER_ASPECT) {
                // 스트림(16:9)이 뷰파인더(1.48)보다 넓으므로 -> 좌우를 잘라냄
                sourceWidth = streamHeight * VIEWFINDER_ASPECT;
                sourceX = (streamWidth - sourceWidth) / 2;
            } else {
                // 스트림이 뷰파인더보다 좁거나 같으므로 -> 상하를 잘라냄
                sourceHeight = streamWidth / VIEWFINDER_ASPECT;
                sourceY = (streamHeight - sourceHeight) / 2;
            }

            // 4. 잘라낸 소스 영역을 최종 캡처 캔버스에 여백 없이 꽉 채워 그립니다.
            captureCtx.drawImage(
                canvasRef.current,
                sourceX, sourceY, sourceWidth, sourceHeight, // 소스 영역 (원본 캔버스)
                0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT          // 타겟 영역 (최종 캡처 캔버스)
            );

            // 최종 dataUrl 사용
            const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.8);
            const newPhotos = [...photos, dataUrl];
            setPhotos(newPhotos);

            if (newPhotos.length === 4) {
                setTimeout(() => onCaptureComplete(newPhotos), 500);
            }
        }
    };

    // --- 렌더링 부분 ---
    return (
        <div className="camera-screen" style={{
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // 화면 세로 중앙 정렬
            backgroundColor: 'var(--color-bg-main)',
            overflow: 'hidden'
        }}>

            {/* --- 카메라 프레임 컨테이너 --- */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '600px',
                padding: '20px',
                boxSizing: 'border-box',
                // 👇 [수정됨]: vh 단위로 변경하여 기종별 높이 차이를 보정합니다.
                marginTop: '5vh'
            }}>

                {/* 프레임 이미지 (가장 앞쪽) */}
                <img
                    src={cameraOverlay}
                    alt="Camera Frame"
                    style={{
                        position: 'relative',
                        zIndex: 20,
                        width: '100%',
                        display: 'block',
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.3))'
                    }}
                />

                {/* B. 비디오 화면 (이미지 뒤쪽 혹은 구멍 위치) */}
                <div style={{
                    position: 'absolute',
                    zIndex: 10,
                    backgroundColor: '#000',
                    overflow: 'hidden',

                    // ▼▼▼▼▼ [CSS 위치 및 크기 유지] ▼▼▼▼▼
                    top: '30.5%',      // 이미지 상단 위치
                    left: '18.5%',     // 이미지 왼쪽 위치
                    width: '44%',    // 가로 너비
                    height: '49%',   // 세로 높이 (약 1.48 비율)
                    // ▲▲▲▲▲ [유지] ▲▲▲▲▲

                    borderRadius: '4px',
                }}>
                    {/* onLoadedData 핸들러 추가 */}
                    <video ref={videoRef} onLoadedData={handleVideoLoaded} style={{ display: 'none' }} />

                    {/* 캔버스 width/height를 동적 상태로 연결 */}
                    <canvas
                        ref={canvasRef}
                        width={videoDimensions.width}
                        height={videoDimensions.height}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

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
                marginTop: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                zIndex: 30
            }}>
                { }
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