import React from 'react';

const StartScreen = ({ onStart }) => {
    return (
        <div className="start-screen" style={{
            // 전체 컨테이너 설정
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between', // 상단-중단-하단 분배를 위해 사용
            minHeight: '100vh', // 화면 전체 높이 사용
            padding: '20px',
            boxSizing: 'border-box',
            textAlign: 'center',
            color: 'var(--color-text-main)',
        }}>

            {/* 1. 상단/중앙 메인 콘텐츠 영역 (Flex: 1로 남은 공간 차지) */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1, // 화면의 남은 공간을 모두 차지하여 푸터를 아래로 밀어냄
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '3.5rem', // 타이틀 강조
                    color: 'var(--color-text-main)',
                    textShadow: '2px 2px 0px var(--color-frame-bg)',
                    marginBottom: '10px',
                    letterSpacing: '2px'
                }}>
                    FREQZ
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '60px', // 타이틀 그룹과 버튼 그룹 사이 여백
                    color: 'var(--color-frame-text)',
                    fontStyle: 'italic',
                }}>
                    Now, catch the frequency flowing around me!
                </p>

                {/* 프로모션 텍스트와 버튼을 그룹화 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <p style={{
                        fontSize: '0.95rem',
                        opacity: 0.9,
                        //maxWidth: '80%',
                        lineHeight: '1.5'
                    }}>
                        앱 설치 없이 바로 경험<br />
                        <strong>12월, 웹에서 가장 먼저 FREQZ light를 만나보세요!</strong>
                    </p>

                    <button
                        onClick={onStart}
                        style={{
                            backgroundColor: 'var(--color-frame-text)',
                            padding: '16px 50px',
                            fontSize: '1.5rem',
                            color: 'var(--color-bg-main)',
                            border: 'none', // 기본 테두리 제거 (필요시 주석 해제)
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
                        START
                    </button>
                </div>
            </div>

            {/* 2. 하단 푸터 영역 (개인정보 문구) */}
            <div style={{
                paddingBottom: '20px', // 바닥과의 여백
                fontSize: '0.8rem',
                color: 'var(--color-frame-text)',
                opacity: 0.6, // 덜 강조되도록 투명도 조절
                width: '100%'
            }}>
                <p>FREQZ 포토부스는 사용자의 사진 원본을 서버에 저장하지 않습니다.</p>
                <p style={{ fontSize: '0.7rem', marginTop: '5px' }}>글꼴 출처: 부크크명조 (눈누)</p>
            </div>
        </div>
    );
};

export default StartScreen;