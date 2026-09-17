/** 집사이 심볼: 집 지붕 + 말풍선(AI 대화·민원 접수). 색은 브랜드 토큰을 따른다. */
export function LogoSymbol({ size = "medium" }: { size?: "medium" | "large" }) {
  return (
    <svg className={`logo-symbol logo-symbol--${size}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect className="logo-symbol__bg" width="64" height="64" rx="16" />
      <path className="logo-symbol__fg logo-symbol__roof" d="M32 13.5 50.5 29.5H13.5Z" strokeWidth="5" strokeLinejoin="round" />
      <path className="logo-symbol__fg" d="M17 26h30v16.5a4.5 4.5 0 0 1-4.5 4.5H29l-8.2 6.4a1 1 0 0 1-1.6-.8V47h-.2A2 2 0 0 1 17 45Z" />
      <circle className="logo-symbol__bg" cx="24.5" cy="36.5" r="2.7" />
      <circle className="logo-symbol__bg" cx="32" cy="36.5" r="2.7" />
      <circle className="logo-symbol__bg" cx="39.5" cy="36.5" r="2.7" />
    </svg>
  );
}

/** 심볼 + 워드마크 */
export function Logo() {
  return (
    <>
      <LogoSymbol />
      <span className="logo-wordmark">집사이</span>
    </>
  );
}
