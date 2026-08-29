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
  // この時間以内の確定結果は、同じ発話の修正版としてまとめる
  const MERGE_MS = 4000;

  const LISTENING_MESSAGE =
    "(聞いています。おじいちゃんに伝えたいことをこの画面に向かって話しかけてください。)";

  const startBtn = document.getElementById("start-btn");
  const resultDiv = document.getElementById("result");
  let isListening = false;
  let finalized = [];
  let interim = "";

  function normalize(text) {
    return text.trim().replace(/\s+/g, " ");
  }

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
    const trimmed = normalize(text);
    if (!trimmed) {
      return;
    }

    const now = Date.now();
    const last = finalized[finalized.length - 1];

    if (last && last.text === trimmed) {
      return;
    }

    // 同じ発話の段階的な確定結果（短い版→長い版）を1行にまとめる
    if (last && now - last.createdAt < MERGE_MS) {
      if (trimmed.startsWith(last.text)) {
        last.text = trimmed;
        last.createdAt = now;
        render();
        setTimeout(render, DISPLAY_MS);
        return;
      }
      if (last.text.startsWith(trimmed)) {
        render();
        setTimeout(render, DISPLAY_MS);
        return;
      }
    }

    finalized.push({ text: trimmed, createdAt: now });
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
