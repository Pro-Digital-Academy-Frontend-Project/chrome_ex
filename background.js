console.log('background.js 로드 성공');

let lastMessage = null; // 마지막 본문 메시지를 저장

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('백그라운드에서 받은 메시지:', message);
  if (message.type === 'article_text') {
    lastMessage = message; // 메시지를 저장
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('팝업에 메시지를 보낼 수 없습니다. 팝업이 닫혀 있거나 활성화되지 않았습니다.');
      } else {
        console.log('팝업으로 메시지 전송 성공:', response);
      }
    });
  } else {
    console.warn('알 수 없는 메시지 타입:', message.type);
  }
});

// 팝업이 연결되었을 때 저장된 메시지를 전송
chrome.runtime.onConnect.addListener((port) => {
  console.log('팝업 연결 성공:', port.name);
  if (lastMessage) {
    console.log('저장된 메시지를 팝업으로 전송:', lastMessage);
    port.postMessage(lastMessage);
  }
});
