const tallyScriptSrc = 'https://tally.so/widgets/embed.js';

type TallyPopupOptions = {
  layout?: 'default' | 'modal';
  width?: number;
};

declare global {
  interface Window {
    Tally?: {
      openPopup: (formId: string, options?: TallyPopupOptions) => void;
    };
  }
}

let tallyLoading: Promise<void> | undefined;

function loadTally() {
  tallyLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = tallyScriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      tallyLoading = undefined;
      script.remove();
      reject(new Error('Tally 스크립트를 불러오지 못했습니다.'));
    };
    document.head.append(script);
  });
  return tallyLoading;
}

export async function openTallyPopup(formId: string) {
  try {
    await loadTally();
    window.Tally?.openPopup(formId, { layout: 'modal', width: 480 });
  } catch {
    window.open(`https://tally.so/r/${formId}`, '_blank', 'noopener');
  }
}
