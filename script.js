// === Mood Into Art: Web Speech API Only + Backend Integration ===

let isRecording = false;
let countdown = 60;
let countdownInterval = null;
let thinkingInterval = null;
let recognition = null;
let transcriptBuffer = "";

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
let audioContext, analyser, dataArray, source;

// ⏱ Real-time Clock
function updateDateTime() {
  const now = new Date();
  const dateTimeString = now.toISOString().slice(0, 19).replace("T", " ");
  document.getElementById('dateTimeDisplay').textContent = dateTimeString;
}
setInterval(updateDateTime, 1000);

// 🎵 Setup waveform visualizer
function setupWaveform() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.frequencyBinCount);

  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    drawWaveform();
  }).catch(err => {
    console.error('Mic error:', err);
    alert('Microphone access denied.');
    stopRecording();
  });
}

function drawWaveform() {
  if (!isRecording) return;
  requestAnimationFrame(drawWaveform);
  analyser.getByteTimeDomainData(dataArray);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= canvas.width; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.strokeStyle = '#ff0';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;
  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

// 🧠 Thinking animation
function startGeneratingDots() {
  const thinking = document.getElementById('thinking');
  if (!thinking) return;
  let dotCount = 0;
  thinkingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 5;
    thinking.textContent = 'Generating' + '.'.repeat(dotCount);
  }, 500);
}
function stopThinkingText() {
  const thinking = document.getElementById('thinking');
  if (!thinking) return;
  clearInterval(thinkingInterval);
  thinking.textContent = '';
  thinking.style.display = 'none';
}

// 🎙️ Setup Web Speech API
function setupWebSpeechAPI() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Web Speech API not supported.");
    return stopRecording();
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = event => {
    const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
    document.getElementById('activityInput').value = transcript;
    transcriptBuffer = transcript;
  };

  recognition.onerror = err => {
    console.error('Web Speech API error:', err);
    stopRecording();
  };

  recognition.onend = () => {
    if (isRecording) recognition.start();
  };

  recognition.start();
}

// 🎙️ Start voice capture
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
    isRecording = true;
    transcriptBuffer = '';
    document.getElementById('activityInput').value = '';
    document.getElementById('startVoice').textContent = 'Stop Voice';
    document.getElementById('startVoice').classList.add('recording');

    countdown = 60;
    document.getElementById('countdownDisplay').textContent = `00:${countdown}`;
    countdownInterval = setInterval(updateCountdown, 1000);

    setupWaveform();
    setupWebSpeechAPI();
  }).catch(err => {
    console.error("Mic error:", err);
    alert('Mic access denied.');
    stopRecording();
  });
}

// 🛑 Stop recording
function stopRecording() {
  isRecording = false;
  document.getElementById('startVoice').textContent = 'Start Voice';
  document.getElementById('startVoice').classList.remove('recording');
  clearInterval(countdownInterval);
  countdown = 60;
  document.getElementById('countdownDisplay').textContent = `00:${countdown}`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (recognition) recognition.stop();
  stopThinkingText();
}

// ⏳ Countdown display
function updateCountdown() {
  countdown--;
  document.getElementById('countdownDisplay').textContent = `00:${countdown.toString().padStart(2, '0')}`;
  if (countdown <= 0) stopRecording();
}

// 🧠 Generate Image
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startVoice').addEventListener('click', () => {
    isRecording ? stopRecording() : startRecording();
  });

  document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('activityInput').value = '';
    document.getElementById('generatedImage').style.display = 'none';
  });

  document.getElementById('generate').addEventListener('click', async () => {
    const mood = document.getElementById('activityInput').value;
    const style = document.getElementById('styleSelect').value;
    const image = document.getElementById('generatedImage');
    const thinking = document.getElementById('thinking');

    if (!mood) {
      alert("Please describe your mood first.");
      return;
    }
    if (!style || style === 'none') {
      alert("Please choose an art style.");
      return;
    }

    startGeneratingDots();
    thinking.style.display = 'block';

    try {
      const res = await fetch('https://synthcalm-a2n7.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${mood} in ${style} style` })
      });

      const data = await res.json();
      if (data.image) {
        image.src = `data:image/png;base64,${data.image}`;
        image.style.display = 'block';
      } else {
        alert("No image returned from server.");
      }
    } catch (err) {
      console.error("Image generation error:", err);
      alert("Error generating image. Please try again.");
    } finally {
      stopThinkingText();
    }
  });
});
