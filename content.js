console.log('content.js 시작');
alert('content.js 실행 확인'); // 브라우저에서 경고창으로 실행 여부를 확인

document.addEventListener('load', () => {
  console.log('DOMContentLoaded 이벤트 발생');

  // DOM 변경 감지
  const observeDOM = () => {
    const target = document.body;
    const observer = new MutationObserver(() => {
      const articleBody =
        document.querySelector('#dic_area') ||
        document.querySelector('.content') ||
        document.querySelector('.news-end-body') ||
        document.querySelector('.article_body') ||
        document.querySelector('.article-content');

      if (articleBody) {
        console.log('본문 발견 성공:', articleBody.innerText.trim()); // 디버깅 로그
        chrome.runtime.sendMessage({ type: 'article_text', text: articleBody.innerText.trim() });
        observer.disconnect(); // 감지 중지
      } else {
        console.error('본문을 찾지 못했습니다. DOM 구조 확인 필요.');
      }
    });

    observer.observe(target, { childList: true, subtree: true });
  };

  observeDOM();
});
