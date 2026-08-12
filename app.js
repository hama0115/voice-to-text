const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert(
    "このブラウザはWeb Speech APIに対応していません。Google Chrome等を使ってください。",
  );
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "ja-JP";
  recognition.interimResults = true; // リアルタイムで文字にする
  recognition.continuous = true; // 自動で終了させない

  const btn = document.getElementById("toggle-btn");
  const micStatus = document.getElementById("mic-status");
  const resultDiv = document.getElementById("result");
  let isListening = false;

  // 音声認識結果を受け取ったとき
  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    resultDiv.textContent = transcript;
  };

  // 止まってしまったときの自動再開
  recognition.onend = () => {
    if (isListening) {
      recognition.start();
    }
  };

  // ボタンクリックでON/OFF切り替え
  btn.addEventListener("click", () => {
    if (isListening) {
      recognition.stop();
      isListening = false;
      micStatus.textContent = "マイクがOFFになっています";
      btn.classList.remove("is-listening");
    } else {
      recognition.start();
      isListening = true;
      micStatus.textContent = "マイクがONになっています";
      btn.classList.add("is-listening");
    }
  });
}
