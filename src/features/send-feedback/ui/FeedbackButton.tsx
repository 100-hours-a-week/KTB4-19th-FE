import { openTallyPopup } from '../lib/tally';

const feedbackFormId = 'EkyAOo';

export function FeedbackButton() {
  return (
    <button
      className="topbar-feedback"
      type="button"
      onClick={() => void openTallyPopup(feedbackFormId)}
    >
      의견 보내기
    </button>
  );
}
