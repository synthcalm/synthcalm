const activityInput = document.getElementById("activityInput");
const styleSelect = document.getElementById("styleSelect");
const startVoiceButton = document.getElementById("startVoice");
const generateButton = document.getElementById("generate");
const saveButton = document.getElementById("saveImage");
const redoButton = document.getElementById("redo");
const countdownDisplay = document.getElementById("countdownDisplay");
const dateTimeDisplay = document.getElementById("dateTimeDisplay");
const waveform = document.getElementById("waveform");
const waveformCtx = waveform.getContext("2d");
const generatedImage = document.getElementById("generatedImage");
const moodHistory = document.getElementById("moodHistory");

let isRecording = false;
let stream, audioContext, analyser, dataArray, source, animationId;
let countdownInterval, secondsLeft = 60;
let socket;

// Show date and time
setInterval(() => {
  const now = new Date();
  dateTimeDisplay.innerHTML =
    now.getFullYear() +
    "/" +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    now.getDate().toString().padStart(2, "0") +
    "<br>" +
    now.toTimeString().split(" ")[0];
}, 1000);

// Countdown
function startCountdown() {
  secondsLeft = 60;
  countdownDisplay.textContent = "01:00";
  countdownInterval = setInterval(() => {
    secondsLeft--;
    const min = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, "0");
    const sec = (secondsLeft % 60).toString().padStart(2, "0");
    countdownDisplay.textContent = `${min}:${sec}`;
    if (secondsLeft <= 0) {
      stopRecording();
    }
  }, 1000);
}

// Waveform
function drawWaveform() {
  analyser.getByteTimeDomainData(dataArray);
  waveformCtx.fillStyle = "#000";
  waveformCtx.fillRect(0, 0, waveform.width, waveform.height);

  waveformCtx.lineWidth = 2;
  waveformCtx.strokeStyle = "#0ff";
  waveformCtx.beginPath();

  const sliceWidth = waveform.width / analyser.frequencyBinCount;
  let x = 0;
  for (let i = 0; i < analyser.frequencyBinCount; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * waveform.height) / 2;
    if (i === 0) waveformCtx.moveTo(x, y);
    else waveformCtx.lineTo(x, y);
    x += sliceWidth;
  }
  waveformCtx.stroke();
  animationId = requestAnimationFrame(drawWaveform);
}

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    drawWaveform();

    const res = await fetch("https://mood-into-art-backend.onrender.com/assemblyai-token");
    const { token } = await res.json();

    socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`, []);

    socket.onopen = () => {
      const recognitionStream = audioContext.createScriptProcessor(4096, 1, 1);
      source.connect(recognitionStream);
      recognitionStream.connect(audioContext.destination);

      recognitionStream.onaudioprocess = (e) => {
        if (socket.readyState === WebSocket.OPEN) {
          const floatData = e.inputBuffer.getChannelData(0);
          const int16Data = new Int16Array(floatData.length);
          for (let i = 0; i < floatData.length; i++) {
            int16Data[i] = Math.max(-32768, Math.min(32767, floatData[i] * 32767));
          }
          socket.send(int16Data.buffer);
        }
      };
    };

    socket.onmessage = (msg) => {
      const res = JSON.parse(msg.data);
      if (res.text) {
        activityInput.value = res.text;
      }
    };

    isRecording = true;
    startVoiceButton.textContent = "Stop Voice";
    startCountdown();
  } catch (err) {
    alert("Microphone access denied or error: " + err.message);
  }
}

function stopRecording() {
  if (animationId) cancelAnimationFrame(animationId);
  if (socket) socket.close();
  if (stream) stream.getTracks().forEach((track) => track.stop());
  if (audioContext) audioContext.close();

  isRecording = false;
  startVoiceButton.textContent = "Start Voice";
  clearInterval(countdownInterval);
}

// Event Listeners
startVoiceButton.addEventListener("click", () => {
  isRecording ? stopRecording() : startRecording();
});

generateButton.addEventListener("click", () => {
  const mood = activityInput.value.trim();
  const style = styleSelect.value;
  if (!mood || style === "none") {
    alert("Please describe your mood and select a style.");
    return;
  }

  const prompt = `${mood} (${styleSelect.options[styleSelect.selectedIndex].text})`;
  const timestamp = new Date().toLocaleString();

  const entry = document.createElement("div");
  entry.className = "history-entry";
  entry.innerHTML = `
    <div class="timestamp">${timestamp}</div>
    <div class="entry-content" contenteditable="true">${prompt}</div>
    <div class="entry-actions">
      <button class="entry-btn delete-btn">✕</button>
    </div>
  `;
  entry.querySelector(".delete-btn").onclick = () => entry.remove();
  moodHistory.prepend(entry);

  generatedImage.src = "https://via.placeholder.com/1080x1080.png?text=Generated+Image";
  generatedImage.style.display = "block";
});

redoButton.addEventListener("click", () => {
  activityInput.value = "";
  styleSelect.value = "none";
  generatedImage.style.display = "none";
});

saveButton.addEventListener("click", () => {
  const image = generatedImage;
  if (image.src) {
    const link = document.createElement("a");
    link.href = image.src;
    link.download = "mood-art.png";
    link.click();
  }
});
