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

  // 発話が残る秒数をここで調整
  const DISPLAY_MS = 15000;

  const LISTENING_MESSAGE =
    "聞いています。おじいちゃんに伝えたいことをこの画面に向かって話しかけてください。";

  const startBtn = document.getElementById("start-btn");
  const resultDiv = document.getElementById("result");
  let isListening = false;
  let finalized = [];
  let interim = "";

  function render() {
    const now = Date.now();
    finalized = finalized.filter((line) => now - line.createdAt < DISPLAY_MS);

    resultDiv.replaceChildren();

    if (finalized.length === 0 && !interim) {
      resultDiv.textContent = LISTENING_MESSAGE;
      return;
    }

    finalized.forEach((line, index) => {
      const p = document.createElement("p");
      p.className = "utterance";
      if (index === finalized.length - 1 && !interim) {
        p.classList.add("is-latest");
      }
      p.textContent = line.text;
      resultDiv.appendChild(p);
    });

    if (interim) {
      const p = document.createElement("p");
      p.className = "utterance is-latest is-interim";
      p.textContent = interim;
      resultDiv.appendChild(p);
    }
  }

  function pushLine(text) {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    finalized.push({ text: trimmed, createdAt: Date.now() });
    render();
    setTimeout(render, DISPLAY_MS);
  }

  // 音声認識結果を受け取ったとき
  recognition.onresult = (event) => {
    interim = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        pushLine(text);
      } else {
        interim += text;
      }
    }

    render();
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
    render();
  });
}
