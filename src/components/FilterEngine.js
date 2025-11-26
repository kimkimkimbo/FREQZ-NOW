/**
 * Applies a vintage/digicam filter to the canvas context.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context.
 * @param {number} width - Canvas width.
 * @param {number} height - Canvas height.
 */
export const applyVintageFilter = (ctx, width, height) => {

    // =========================================================
    // ▼▼▼ [필터 강도 조절 파라미터] ▼▼▼
    const BRIGHTNESS_PERCENT = 1.3; // 밝기 조절: 1.1 = 10% 증가, 0.9 = 10% 감소
    const BLUR_PIXELS = 3;         // 블러 강도 조절: (예: 1px, 2px 등)
    const CONTRAST_FACTOR = 1.0;    // 대비 강도 조절 (1.0 = 변화 없음)
    const SATURATION_FACTOR = 0.8;  // 채도 강도 조절 (1.0 = 변화 없음, 0.0 = 흑백)
    const WARM_TINT_R = 10;         // 붉은 기 추가 (따뜻한 톤)
    const NOISE_INTENSITY = 20;     // [새로운 파라미터] 노이즈 강도 (0 = 없음, 숫자가 높을수록 노이즈 강해짐)
    // ▲▲▲ [필터 강도 조절 파라미터] ▲▲▲
    // =========================================================

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 0. 밝기 조절 (Brightness Adjustment)
        r *= BRIGHTNESS_PERCENT;
        g *= BRIGHTNESS_PERCENT;
        b *= BRIGHTNESS_PERCENT;

        // 1. High Contrast & Saturation Adjustment
        const factor = (259 * (CONTRAST_FACTOR + 255)) / (255 * (259 - CONTRAST_FACTOR));

        let newR = factor * (r - 128) + 128;
        let newG = factor * (g - 128) + 128;
        let newB = factor * (b - 128) + 128;

        // 2. Warm/Pink Tint (Cozy Mood)
        newR += WARM_TINT_R;
        newG += 5;
        newB += 10;

        // 3. Desaturation (Slightly)
        const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB;

        newR = gray + (newR - gray) * SATURATION_FACTOR;
        newG = gray + (newG - gray) * SATURATION_FACTOR;
        newB = gray + (newB - gray) * SATURATION_FACTOR;

        // 4. Noise/Grain Addition
        // -1.0에서 1.0 사이의 랜덤 값으로 노이즈를 추가
        const noise = (Math.random() - 0.5) * NOISE_INTENSITY;
        newR += noise;
        newG += noise;
        newB += noise;

        // 최종 값 적용 및 0~255 범위 클램핑
        data[i] = Math.min(255, Math.max(0, newR));
        data[i + 1] = Math.min(255, Math.max(0, newG));
        data[i + 2] = Math.min(255, Math.max(0, newB));
    }

    ctx.putImageData(imageData, 0, 0);

    // 5. Blur Effect (Soft Focus / Dreamy)
    ctx.filter = `blur(${BLUR_PIXELS}px)`;
    ctx.drawImage(ctx.canvas, 0, 0);
    ctx.filter = 'none'; // 필터 초기화
};