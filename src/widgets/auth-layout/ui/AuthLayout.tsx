import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/shared/ui';

/** 로그인·회원가입·역할 선택이 공유하는 좌측 비주얼 + 우측 폼 레이아웃 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="brand brand--visual">
            <Logo size="large" />
          </div>
          <h1>건물 생활을 더 가깝고 편하게</h1>
          <p>입주부터 문의, 민원 처리까지 zipsAI에서 연결하세요.</p>
        </div>
      </div>
      <main className="auth-form">
        <Link className="brand brand--mobile" to="/auth/login">
          <Logo />
        </Link>
        {children}
        <footer className="auth-service-info">
          <p>
            zipsAI(집사이)는 소형 임대 건물의 관리자와 입주민을 연결하는 AI 기반 건물 관리 서비스입니다.
            건물 정보 안내, 민원 접수와 처리 현황을 한곳에서 관리할 수 있습니다.
          </p>
          <p>
            문의하기: <a href="mailto:max@zipsai.co.kr">max@zipsai.co.kr</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
