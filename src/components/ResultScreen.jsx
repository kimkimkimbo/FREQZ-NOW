import React, { useEffect, useRef } from 'react';

const ResultScreen = ({ photos, onRestart }) => {
  const stripRef = useRef(null);

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const downloadStrip = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // ▼▼▼▼▼ [Canvas 설정값: 미리보기 CSS 비율에 맞춰 업데이트] ▼▼▼▼▼
    // 미리보기 (CSS) 설정: max-width: 340px, padding: 25px, gap: 15px

    // 1. 패딩/간격 설정 (CSS 값과 동일하게 적용)
    const padding = 25;  // CSS padding: 25px
    const gap = 15;      // CSS gap: 15px

    // 2. 전체 너비 설정 (CSS max-width: 340px)
    // 미리보기에서 사진이 차지하는 실제 너비: 340px (최대) - (25px * 2) = 290px
    const photoWidth = 290;

    // 3. 높이 설정 (4:3 비율 유지)
    const photoHeight = (photoWidth * 3) / 4; // 290 * 0.75 = 217.5

    const headerHeight = 0;
    const footerHeight = 100; // 푸터 높이도 비율에 맞춰 살짝 줄임 (원래 150px)

    // 총 너비 계산: photoWidth + (padding * 2) = 290 + 50 = 340px
    const totalWidth = photoWidth + (padding * 2);
    const totalHeight = padding + (photos.length * (photoHeight + gap)) + footerHeight + padding;
    // ▲▲▲▲▲ [업데이트 완료] ▲▲▲▲▲

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Background - Christmas Theme (미리보기 CSS 색상과 동일하게 설정)
    ctx.fillStyle = '#9E1030'; // CSS에서 var(--color-frame-bg)가 이 색상이라고 가정하고 명시적으로 지정
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Draw Photos
    const loadImg = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

    for (let i = 0; i < photos.length; i++) {
      const img = await loadImg(photos[i]);
      const y = padding + (i * (photoHeight + gap));

      // Draw photo directly
      ctx.drawImage(img, padding, y, photoWidth, photoHeight);
    }

    // Draw Footer Text
    ctx.fillStyle = '#e9877e'; // Frame Text Color
    // 폰트 크기도 비율에 맞춰 조정 (원래 60px -> 45px)
    ctx.font = '45px BookkMyungjo';
    ctx.textAlign = 'center';
    ctx.fillText('FREQZ', totalWidth / 2, totalHeight - 40); // Y 위치도 조정됨

    const finalImage = canvas.toDataURL('image/png');
    downloadImage(finalImage, 'FREQZ_NOW.png');
  };

  return (
    <div className="result-screen" style={{ textAlign: 'center', paddingBottom: '50px', color: 'var(--color-text-main)' }}>
      <h4 style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>12월, 웹에서 가장 먼저 FREQZ light를 만나보세요!</h4>

      {/* Preview (Visual only) */}
      <div style={{
        // 이 CSS 설정값에 맞춰 Canvas 설정이 조정되었습니다.
        display: 'flex', flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'var(--color-frame-bg)',
        padding: '25px',
        margin: '0 auto 30px',
        maxWidth: '340px'
      }}>
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Shot ${index + 1}`} style={{ width: '100%' }} />
        ))}
        <div style={{ fontFamily: 'BookkMyungjo', fontSize: '2rem', color: 'var(--color-frame-text)', marginTop: '10px' }}>
          FREQZ
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <button
          onClick={downloadStrip}
          style={{
            backgroundColor: 'var(--color-frame-text)',
            padding: '16px 50px',
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
          DOWNLOAD STRIP
        </button>

        <button
          onClick={onRestart}
          style={{
            backgroundColor: 'var(--color-frame-text)',
            padding: '16px 50px',
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
          START AGAIN
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;