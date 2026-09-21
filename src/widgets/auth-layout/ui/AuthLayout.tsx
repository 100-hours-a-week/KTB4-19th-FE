import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo, LogoSymbol } from '@/shared/ui';

/** 로그인·회원가입·역할 선택이 공유하는 좌측 비주얼 + 우측 폼 레이아웃 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <LogoSymbol size="large" />
          <h1>건물 생활을 더 가깝고 편하게</h1>
          <p>입주부터 문의, 민원 처리까지 집사이에서 연결하세요.</p>
        </div>
      </div>
      <main className="auth-form">
        <Link className="brand brand--mobile" to="/auth/login">
          <Logo />
        </Link>
        {children}
      </main>
    </div>
  );
}
