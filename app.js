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

  const startBtn = document.getElementById("start-btn");
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

  // ボタンクリックでマイクをON（このあと止めない）
  startBtn.addEventListener("click", () => {
    recognition.start();
    isListening = true;
    document.body.classList.add("is-listening");
    resultDiv.textContent =
      "聞いています。おじいちゃんに伝えたいことをこの画面に向かって話しかけてください。";
  });
}
