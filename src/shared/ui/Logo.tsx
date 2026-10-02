/** 둥근 42를 지붕 아치와 바닥선으로 감싼 집 모티프. */
export function LogoSymbol({ size = 'medium' }: { size?: 'medium' | 'large' }) {
  return (
    <img
      className={`logo-symbol logo-symbol--${size}`}
      src="/brand/zipsai-42-roof.png"
      width={size === 'large' ? 56 : 38}
      height={size === 'large' ? 56 : 38}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

/** 심볼 + 워드마크 */
export function Logo({ size = 'medium' }: { size?: 'medium' | 'large' }) {
  return (
    <>
      <LogoSymbol size={size} />
      <span className="logo-wordmark">zipsAI</span>
    </>
  );
}
