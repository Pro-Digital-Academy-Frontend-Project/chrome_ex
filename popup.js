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
      inNewsPage.style.display = 'block';
    } else {
      // 뉴스 기사 페이지가 아닌 경우
      notInNewsPage.style.display = 'block';
      inNewsPage.style.display = 'none';
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
  function bringStockInfo(keywordId) {
    const url = `http://localhost:3000/api/keywords/${keywordId}/stock-rankings`;
    console.log(`API 호출 URL: ${url}`);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP 상태 코드 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('API 응답 데이터:', data);
        const stockRankings = data.stock_rankings;
        if (stockRankings && stockRankings.length > 0) {
          updateStockItems(stockRankings);
        } else {
          console.error('주식 정보를 가져오지 못했습니다.');
        }
      })
      .catch((error) => console.error('주식 정보 API 호출 중 오류 발생:', error));
  }

  function updateStockItems(stockRankings) {
    stockList.innerHTML = ''; // 기존 항목 초기화
    stockRankings.forEach((stock, index) => {
      const stockItem = document.createElement('div');
      stockItem.classList.add('stock-item');
      stockItem.dataset.symbol = stock.code;
      stockItem.innerHTML = `
        <span style="color: #0046ff; margin-right: 10px">${index + 1}</span>
        ${stock.stock_name} (가중치: ${stock.weight.toFixed(2)})
      `;
      stockList.appendChild(stockItem);

      // 주가 가져오기 후 추가 정보 업데이트
      fetchCurrentStockPrice(stock.code, (price) => {
        stockItem.innerHTML += `<span style="margin-left: 10px; color: #555;">현재가: ${price}원</span>`;
      });
    });
  }
  bringStockInfo('92');
});
