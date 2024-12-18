document.addEventListener('DOMContentLoaded', () => {
  console.log('popup.js 로드 성공');
  const newsContent = document.getElementById('news-content');

  chrome.runtime.onMessage.addListener((message) => {
    console.log('팝업에서 받은 메시지:', message); // 메시지 수신 확인
    if (message.type === 'article_text') {
      newsContent.innerHTML = `<p>${message.text}</p>`;
    } else {
      newsContent.innerHTML = '<p>기사를 불러올 수 없습니다.</p>';
    }
  });
});
