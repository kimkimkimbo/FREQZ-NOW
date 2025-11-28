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
    // [수정] 고해상도 출력을 위한 스케일 팩터 정의 (예: 3배 확대)
    const DPI_SCALE = 3;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // ▼▼▼▼▼ [Canvas 기본 설정값] ▼▼▼▼▼
    // 여기서 계산되는 값들은 CSS 픽셀 기준입니다.
    const padding = 25;  // CSS padding: 25px
    const gap = 15;      // CSS gap: 15px

    // ▼▼▼ [프레임 두께 조절] ▼▼▼
    // 사진 위로 덮어씌워지는 프레임의 두께입니다. 숫자를 키우면 프레임이 사진을 더 많이 가립니다.
    const frameOverlap = 12;
    // ▲▲▲ [조절 끝] ▲▲▲

    // 2. 전체 너비 설정 (CSS max-width: 340px)
    // 미리보기에서 사진이 차지하는 실제 너비: 340px (최대) - (25px * 2) = 290px
    const photoWidth = 290;

    // 3. 높이 설정 (4:3 비율 유지)
    const photoHeight = (photoWidth * 3) / 4; // 290 * 0.75 = 217.5

    const headerHeight = 0;
    const footerHeight = 100; // 푸터 높이도 비율에 맞춰 살짝 줄임 (원래 150px)

    // 총 너비 계산 (CSS 기준)
    const cssTotalWidth = photoWidth + (padding * 2);
    const cssTotalHeight = padding + (photos.length * (photoHeight + gap)) + footerHeight + padding;
    // ▲▲▲▲▲ [Canvas 기본 설정값] ▲▲▲▲▲

    // [수정] 캔버스 실제 해상도 설정 (기본 CSS 크기 * DPI_SCALE)
    canvas.width = cssTotalWidth * DPI_SCALE;
    canvas.height = cssTotalHeight * DPI_SCALE;

    // [수정] Context 스케일링: 모든 이후 그리기 명령이 DPI_SCALE 배 확대되어 그려지게 설정
    ctx.scale(DPI_SCALE, DPI_SCALE);

    // Background - Christmas Theme (미리보기 CSS 색상과 동일하게 설정)
    ctx.fillStyle = '#9E1030'; // CSS에서 var(--color-frame-bg)가 이 색상이라고 가정하고 명시적으로 지정
    // [수정] fillRect는 이제 CSS 크기 기준으로 인자를 사용합니다. (ctx.scale 덕분)
    ctx.fillRect(0, 0, cssTotalWidth, cssTotalHeight);

    // Draw Photos
    const loadImg = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src;
    });

    for (let i = 0; i < photos.length; i++) {
      const img = await loadImg(photos[i]);
      // [수정] 모든 위치/크기 변수도 CSS 크기 기준으로 사용합니다.
      const y = padding + (i * (photoHeight + gap));

      // [Fix] Implement 'object-fit: cover' logic for canvas
      // Calculate aspect ratios
      const imgAspect = img.width / img.height;
      const targetAspect = photoWidth / photoHeight;

      let renderWidth, renderHeight, offsetX, offsetY;

      if (imgAspect > targetAspect) {
        // Image is wider than target: crop sides
        renderHeight = photoHeight;
        renderWidth = img.width * (photoHeight / img.height);
        offsetX = (photoWidth - renderWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than target: crop top/bottom
        renderWidth = photoWidth;
        renderHeight = img.height * (photoWidth / img.width);
        offsetX = 0;
        offsetY = (photoHeight - renderHeight) / 2;
      }

      // Draw with clipping to ensure we stay within the box
      ctx.save();
      ctx.beginPath();
      ctx.rect(padding, y, photoWidth, photoHeight);
      ctx.clip();
      ctx.drawImage(img, padding + offsetX, y + offsetY, renderWidth, renderHeight);
      ctx.restore();


    }

    // Draw Footer Text
    ctx.fillStyle = '#e9877e'; // Frame Text Color
    // [수정] 폰트 크기도 DPI_SCALE에 맞춰 커지므로, CSS 기준 크기(45px)를 사용합니다.
    ctx.font = '45px BookkMyungjo';
    ctx.textAlign = 'center';
    // [수정] 위치도 CSS 기준 크기 (cssTotalWidth / 2, cssTotalHeight - 40)를 사용합니다.
    ctx.fillText('FREQZ', cssTotalWidth / 2, cssTotalHeight - 40);

    const finalImage = canvas.toDataURL('image/png');
    downloadImage(finalImage, 'FREQZ_NOW.png');
  };

  return (
    <div className="result-screen" style={{ textAlign: 'center', paddingBottom: '50px', color: 'var(--color-text-main)' }}>
      <h4 style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>12월, 웹에서 가장 먼저 FREQZ light를 만나보세요!</h4>
      <h4 style={{ color: 'var(--color-text-main)', marginBottom: '20px' }}>Experience FREQZ light for the first time in December!</h4>

      {/* Preview (Visual only) */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '15px',
        backgroundColor: 'var(--color-frame-bg)',
        padding: '25px',
        margin: '0 auto 30px',
        maxWidth: '340px'
      }}>
        {photos.map((photo, index) => (
          <div key={index} style={{
            width: '100%',
            aspectRatio: '4/3', // Enforce 4:3 aspect ratio
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative' // For border positioning if needed
          }}>
            <img
              src={photo}
              alt={`Shot ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover', // Ensure preview matches canvas crop
                boxSizing: 'border-box',
              }}
            />
          </div>
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

      {/* Social Media Links */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', justifyContent: 'center', marginTop: '30px' }}>
        <a href="https://www.instagram.com/freqz.kr/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid white',
            color: 'white',
            borderRadius: '50%',
            width: '45px', // Reduced size
            height: '45px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            ig
          </button>
        </a>
        <a href="https://www.tiktok.com/@freqz6" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid white',
            color: 'white',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            TikTok
          </button>
        </a>
      </div>
    </div>
  );
};

export default ResultScreen;