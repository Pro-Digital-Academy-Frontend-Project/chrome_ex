console.log('content.js 실행 중');

const extractArticle = () => {
  const articleBody =
    document.querySelector('#dic_area') ||
    document.querySelector('.content') ||
    document.querySelector('.news-end-body') ||
    document.querySelector('.article_body') ||
    document.querySelector('.article-content');

  if (articleBody) {
    console.log('본문 발견:', articleBody.innerText.trim());
    chrome.runtime.sendMessage({ type: 'article_text', text: articleBody.innerText.trim() });
  } else {
    console.error('본문을 찾을 수 없습니다. DOM 구조 확인 필요.');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractArticle);
} else {
  extractArticle();
}
