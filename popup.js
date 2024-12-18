document.addEventListener('DOMContentLoaded', () => {
  console.log('popup.js 로드 성공');
  const newsContent = document.getElementById('news-content');

  // 현재 탭의 URL 확인
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.startsWith('https://n.news.naver.com/article/')) {
      // 뉴스 기사 페이지일 경우 백그라운드와 연결
      const port = chrome.runtime.connect({ name: 'popup-connection' });

      // 백그라운드에서 메시지 수신
      port.onMessage.addListener((message) => {
        console.log('팝업에서 받은 메시지:', message);
        if (message.type === 'article_text') {
          newsContent.innerHTML = `<p>${message.text}</p>`;
        } else {
          newsContent.innerHTML = '<p>기사를 불러올 수 없습니다.</p>';
        }
      });

      // 팝업 열림 알림
      port.postMessage({ type: 'popup_opened' });
    } else {
      // 뉴스 기사 페이지가 아닌 경우
      newsContent.innerHTML = '<p>뉴스 기사 페이지에서 실행해주세요.</p>';
    }
  });
});
