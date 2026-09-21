import { useNavigate } from 'react-router-dom';

/** Android 3버튼 내비게이션. 뒤로·홈은 실제 앱 라우팅으로 동작한다. */
export function AndroidNavBar() {
  const navigate = useNavigate();
  return (
    <nav className="device-nav-bar" aria-label="기기 내비게이션">
      <span className="device-nav-recents" aria-hidden="true" />
      <button
        type="button"
        className="device-nav-button"
        aria-label="홈"
        onClick={() => navigate('/')}
      >
        <span className="device-nav-home" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="device-nav-button"
        aria-label="뒤로"
        onClick={() => navigate(-1)}
      >
        <span className="device-nav-back" aria-hidden="true" />
      </button>
    </nav>
  );
}
