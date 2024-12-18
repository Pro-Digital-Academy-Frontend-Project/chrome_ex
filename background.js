console.log('background.js 로드 성공');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('백그라운드에서 받은 메시지:', message); // 메시지 수신 확인
  if (message.type === 'article_text') {
    chrome.runtime.sendMessage(message); // 팝업으로 전달
  }
});
