document.addEventListener('DOMContentLoaded', () => {
  const keywordInput = document.getElementById('keyword-input');
  const searchResults = document.getElementById('search-results');
  const inNewsPageTitle = document.getElementById('in-news-page-title');
  const searchPageTitle = document.getElementById('search-page-title');
  const keywordNameElements = document.querySelectorAll('.keyword-name'); // 모든 keyword-name 선택
  const inNewsPage = document.getElementById('in-news-page');
  const notInNewsPage = document.getElementById('not-in-news-page');
  const stockList = document.getElementById('stock-list');

  // 검색 결과 초기 숨김
  searchResults.style.display = 'none';
  searchPageTitle.style.display = 'none';

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
      inNewsPageTitle.style.display = 'block';
    } else {
      // 뉴스 기사 페이지가 아닌 경우
      notInNewsPage.style.display = 'block';
      inNewsPage.style.display = 'none';
      inNewsPageTitle.style.display = 'none';
    }
  });

  // 검색어 입력 후 엔터키 이벤트
  keywordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const keyword = keywordInput.value.trim();
      if (keyword) {
        searchKeyword(keyword);
      }
    }
  });

  // 키워드 검색
  function searchKeyword(keyword) {
    const url = `http://localhost:3000/api/keywords/${keyword}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP 상태 코드 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('API 응답 데이터:', data);
        updateSearchResults(data);
      })
      .catch((error) => console.error('키워드 검색 API 호출 중 오류 발생:', error));
  }

  // 검색 결과 업데이트
  function updateSearchResults(keywords) {
    searchResults.innerHTML = ''; // 기존 결과 초기화
    if (keywords.length > 0) {
      searchResults.style.display = 'block'; // 검색 결과 표시
      keywords.forEach((keywordObj) => {
        const keywordItem = document.createElement('div');
        keywordItem.classList.add('search-result-item');
        keywordItem.dataset.id = keywordObj.id;
        keywordItem.textContent = `${keywordObj.keyword} (가중치: ${keywordObj.totalWeight.toFixed(2)})`;
        keywordItem.style.cursor = 'pointer';

        // 항목 클릭 이벤트
        keywordItem.addEventListener('click', () => {
          updateKeywordName(keywordObj.keyword);
          searchResults.style.display = 'none';
          searchPageTitle.style.display = 'block';
          bringStockInfo(keywordObj.id);
        });

        searchResults.appendChild(keywordItem);
      });
    } else {
      searchResults.style.display = 'none'; // 검색 결과 없음
    }
  }

  // 키워드 갱신 및 제목 전환
  function updateKeywordName(keyword) {
    if (keyword && keywordNameElements.length > 0) {
      keywordNameElements.forEach((element) => {
        element.textContent = keyword; // 모든 keyword-name 갱신
      });
      inNewsPageTitle.style.display = 'none'; // 뉴스 제목 숨김
      searchPageTitle.style.display = 'block'; // 검색 제목 표시
    } else {
      console.error('키워드 갱신 오류: 키워드가 비어 있거나 keyword-name 요소가 없습니다.');
    }
  }

  //키워드 추출
  function extractKeyword(article) {
    //현재 페이지의 뉴스 기사를 보내 키워드 정보(keyword_id, keyword) 받음
    //해당 keyword_id로 bringStockInfo 호출
  }

  //주식 정보 불러오기
  function bringStockInfo(keywordId) {
    const url = `http://localhost:3000/api/keywords/${keywordId}/stock-rankings`;
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

  let activeStockItem = null; // 현재 활성화된 stockItem을 추적

  // 종목의 가격 정보 가져오기
  function bringStockCost(stockCode) {
    const url = `http://127.0.0.1:3000/api/stocks/chart/${stockCode}/D`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP 상태 코드 오류: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`종목 코드 ${stockCode}의 가격 정보:`, data);

        if (data && data.length > 0) {
          const latestStockData = data[data.length - 1]; // 배열의 마지막 요소 가져오기
          toggleStockCost(stockCode, latestStockData); // 주식 정보를 토글
        } else {
          console.error('주식 데이터가 비어 있습니다.');
        }
      })
      .catch((error) => console.error('종목 가격 정보 API 호출 중 오류 발생:', error));
  }

  // 주식 정보를 토글 (열기/닫기)
  function toggleStockCost(stockCode, stockData) {
    const stockItem = document.querySelector(`[data-symbol="${stockCode}"]`);

    if (stockItem) {
      // 이미 활성화된 stockItem이 있을 경우 닫기
      if (activeStockItem && activeStockItem !== stockItem) {
        const existingInfo = activeStockItem.querySelector('.stock-cost-info');
        if (existingInfo) existingInfo.remove();
      }

      // 동일한 stockItem을 다시 클릭했을 경우 닫기
      if (activeStockItem === stockItem) {
        const existingInfo = stockItem.querySelector('.stock-cost-info');
        if (existingInfo) existingInfo.remove();
        activeStockItem = null; // 활성화된 stockItem을 초기화
        return;
      }

      // 새로운 주식 정보 표시
      const existingInfo = stockItem.querySelector('.stock-cost-info');
      if (existingInfo) existingInfo.remove(); // 기존 정보 제거

      const stockInfo = document.createElement('div');
      stockInfo.classList.add('stock-cost-info'); // 스타일은 CSS에서 관리

      stockInfo.innerHTML = `
        <div id="label"><strong>날짜:</strong>${stockData.date}</div>
        <div><strong>시가:</strong>${stockData.open.toLocaleString()} 원</div>
        <div><strong>고가:</strong>${stockData.high.toLocaleString()} 원</div>
        <div><strong>저가:</strong>${stockData.low.toLocaleString()} 원</div>
        <div><strong>종가:</strong>${stockData.close.toLocaleString()} 원</div>
        <div><strong>거래량:</strong>${stockData.volume.toLocaleString()}</div>
      `;

      stockItem.appendChild(stockInfo);

      // 현재 활성화된 stockItem 갱신
      activeStockItem = stockItem;
    } else {
      console.error(`Stock item with code ${stockCode}을(를) 찾을 수 없습니다.`);
    }
  }

  //StockItem UI
  function updateStockItems(stockRankings) {
    inNewsPage.style.display = 'block';
    stockList.innerHTML = ''; // 기존 항목 초기화

    // 배열을 5개까지만 제한
    stockRankings.slice(0, 5).forEach((stock, index) => {
      const stockItem = document.createElement('div');
      stockItem.classList.add('stock-item');
      stockItem.dataset.symbol = stock.code;
      stockItem.innerHTML = `
        <span style="color: #0046ff; margin-right: 10px">${index + 1}</span>
        ${stock.stock_name}
      `;

      // 클릭 이벤트 시 해당 주식의 종목 정보 반환
      stockItem.addEventListener('click', () => {
        const stockCode = stockItem.dataset.symbol; // 데이터 속성에서 stockCode 추출
        bringStockCost(stockCode); // bringStockCost 호출
      });

      stockList.appendChild(stockItem);
    });
  }
});
