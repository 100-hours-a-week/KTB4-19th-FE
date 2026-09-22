import {
  IconChevronRightLine,
  IconSparkle2Line,
} from '@karrotmarket/react-monochrome-icon';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { useAuth } from '@/entities/session';
import { PageTitle } from '@/shared/ui';
import { ConversationList } from '@/widgets/conversation-list';

export function ResidentHomePage() {
  const auth = useAuth();
  if (auth.user?.roomId == null) {
    return (
      <>
        <PageTitle eyebrow="입주민 시작하기" title="초대코드를 입력해 주세요" description="관리자에게 받은 초대코드로 건물과 호실을 연결할 수 있어요." />
        <section className="panel onboarding-empty">
          <h2>아직 연결된 호실이 없어요</h2>
          <p>호실을 연결하면 AI 문의와 민원 기능을 이용할 수 있습니다.</p>
          <Link to="/resident/connect"><ActionButton variant="brandSolid">초대코드 입력하기</ActionButton></Link>
        </section>
      </>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="A타워 302호"
        title={`안녕하세요, ${auth.user?.userName ?? '입주민'} 님`}
        description="생활 문의와 민원 접수를 AI 도우미에게 편하게 말씀해 주세요."
      />
      <section className="resident-hero">
        <div>
          <span className="ai-orb">
            <IconSparkle2Line />
          </span>
          <p className="eyebrow">AI 생활 도우미</p>
          <h2>무엇을 도와드릴까요?</h2>
          <p>시설 문제부터 건물 생활 규칙까지 편하게 물어보세요.</p>
          <Link to="/resident/conversations/new">
            <ActionButton variant="brandSolid">새 대화 시작</ActionButton>
          </Link>
        </div>
        <div className="suggestion-list">
          <span>이렇게 물어볼 수 있어요</span>
          <Link to="/resident/conversations/new">
            “천장에서 물이 새요” <IconChevronRightLine />
          </Link>
          <Link to="/resident/conversations/new">
            “분리수거 요일이 언제예요?” <IconChevronRightLine />
          </Link>
          <Link to="/resident/conversations/new">
            “주차 등록은 어떻게 하나요?” <IconChevronRightLine />
          </Link>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <h2>최근 대화</h2>
          <Link to="/resident/conversations">전체 보기</Link>
        </div>
        <ConversationList size={3} compact />
      </section>
    </>
  );
}
