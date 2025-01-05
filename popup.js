document.addEventListener('DOMContentLoaded', () => {
  let articleTxt = null;
  const inNewsPage = document.getElementById('in-news-page');
  const notInNewsPage = document.getElementById('not-in-news-page');
  const stockList = document.getElementById('stock-list');
  const inputField = document.querySelector('input');

  // 현재 탭의 URL 확인
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url && currentTab.url.startsWith('https://n.news.naver.com/article/')) {
      // 뉴스 기사 페이지일 경우 백그라운드와 연결
      const port = chrome.runtime.connect({ name: 'popup-connection' });

      // 백그라운드에서 메시지 수신
      port.onMessage.addListener((message) => {
        if (message.type === 'article_text') {
          articleTxt = message.text;
        }
      });
      port.postMessage({ type: 'popup_opened' });
      notInNewsPage.style.display = 'none';
    } else {
      // 뉴스 기사 페이지가 아닌 경우
      notInNewsPage.style.display = 'block';
    }
  });

  //키워드 검색
  function searchKeyword(keyword) {
    //해당 키워드에 대한 유사 키워드 10개 반환
    //사용자가 검색 결과 중 하나를 선택 시 해당 키워드 id에 대해 bringStockInfo 호출
  }

  //키워드 추출
  function extractKeyword(article) {
    //현재 페이지의 뉴스 기사를 보내 키워드 정보(keyword_id, keyword) 받음
    //해당 keyword_id로 bringStockInfo 호출
  }

  //주식 정보 불러오기
  function bringStockInfo(keword_id) {
    //1. keyword_id로 해당 키워드에 대해 높은 가중치를 갖는 종목 3개를 받음
    //2. 각 종목에 대한 주식 정보(시가, 종가, 고가, 저가, 거래량)를 받아옴
    //3. UI에 적용함
    inNewsPage.style.display = 'block';
  }
});
