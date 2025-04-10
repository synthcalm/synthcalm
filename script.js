let isRecording = false;
let countdown = 60;
let countdownInterval = null;
let thinkingInterval = null;
let recognition = null;
let transcriptBuffer = "";

const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
let audioContext, analyser, dataArray, source;
let isAuthenticated = false;

// ✅ Auth check (safer session-based)
async function checkSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session || !session.user) {
    // If not logged in, show login message and disable buttons
    [ 'startVoice', 'clear', 'generate', 'saveMood', 'activityInput', 'styleSelect', 'prompt' ]
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });

    const msg = document.getElementById('moodHistoryMessage');
    if (msg) msg.style.display = 'block';
    alert("Please log in to use this feature.");
  } else {
    // If logged in, show UI for authenticated users
    isAuthenticated = true;
    const msg = document.getElementById('moodHistoryMessage');
    if (msg) msg.style.display = 'none';

    [ 'startVoice', 'clear', 'generate', 'saveMood', 'activityInput', 'styleSelect', 'prompt' ]
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });

    // Update UI to show that user is logged in
    const userMessage = document.getElementById('userStatus');
    if (userMessage) {
      userMessage.innerText = `Welcome, ${session.user.email}`;
    }
  }
}

// Session check on page load
window.addEventListener('load', checkSession);

function canGenerateImage() {
  const usageKey = 'mia_image_usage';
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  let usage = JSON.parse(localStorage.getItem(usageKey));

  if (!usage || now - usage.resetTime > oneWeek) {
    usage = { count: 0, resetTime: now };
  }

  if (usage.count >= 3) return false;

  usage.count++;
  localStorage.setItem(usageKey, JSON.stringify(usage));
  return true;
}

setInterval(() => {
  const now = new Date();
  document.getElementById('dateTimeDisplay').textContent = now.toISOString().slice(0, 19).replace("T", " ");
}, 1000);

// Waveform setup for voice recording
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

  ctx.strokeStyle = 'rgba(255,255,0,0.3)';
  for (let x = 0; x <= canvas.width; x += 20) ctx.strokeRect(x, 0, 0.5, canvas.height);
  for (let y = 0; y <= canvas.height; y += 20) ctx.strokeRect(0, y, canvas.width, 0.5);

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
  ctx.stroke();
}

// Voice recognition setup
function setupWebSpeechAPI() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Web Speech API not supported.");

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = event => {
    transcriptBuffer = Array.from(event.results).map(r => r[0].transcript).join('');
    document.getElementById('activityInput').value = transcriptBuffer;
  };
  recognition.onerror = err => stopRecording();
  recognition.onend = () => isRecording && recognition.start();
  recognition.start();
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
    isRecording = true;
    transcriptBuffer = '';
    document.getElementById('activityInput').value = '';
    document.getElementById('startVoice').textContent = 'Stop Voice';
    document.getElementById('startVoice').classList.add('recording');
    countdown = 60;
    document.getElementById('countdownDisplay').textContent = `00:${countdown}`;
    countdownInterval = setInterval(() => updateCountdown(), 1000);
    setupWaveform();
    setupWebSpeechAPI();
  });
}

function stopRecording() {
  isRecording = false;
  clearInterval(countdownInterval);
  countdown = 60;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('startVoice').textContent = 'Start Voice';
  document.getElementById('startVoice').classList.remove('recording');
  recognition?.stop();
  stopThinkingText();
}

function updateCountdown() {
  countdown--;
  document.getElementById('countdownDisplay').textContent = `00:${countdown.toString().padStart(2, '0')}`;
  if (countdown <= 0) stopRecording();
}

function startGeneratingDots() {
  const thinking = document.getElementById('thinking');
  let dotCount = 0;
  thinkingInterval = setInterval(() => {
    thinking.textContent = 'Generating' + '.'.repeat(dotCount++ % 5);
  }, 500);
  thinking.style.display = 'block';
}

function stopThinkingText() {
  clearInterval(thinkingInterval);
  const thinking = document.getElementById('thinking');
  thinking.textContent = '';
  thinking.style.display = 'none';
}

// Button actions after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startVoice').addEventListener('click', () => isRecording ? stopRecording() : startRecording());
  document.getElementById('clear').addEventListener('click', () => {
    document.getElementById('activityInput').value = '';
    document.getElementById('generatedImage').style.display = 'none';
  });

  document.getElementById('generate').addEventListener('click', async () => {
    const mood = document.getElementById('activityInput').value;
    const style = document.getElementById('styleSelect').value;
    const image = document.getElementById('generatedImage');
    if (!mood || style === 'none') return alert("Fill out mood and style.");

    if (!isAuthenticated && !canGenerateImage()) return alert("Limit reached. Please log in.");

    if (isAuthenticated) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('image_limit').eq('id', user.id).single();

      const now = new Date();
      const reset = new Date(profile.last_reset);
      const diffDays = (now - reset) / (1000 * 60 * 60 * 24);

      if (diffDays >= 7) {
        await supabase.from('profiles').update({ image_limit: 3, last_reset: now.toISOString() }).eq('id', user.id);
      } else if (profile.image_limit <= 0) {
        return alert("Limit exceeded. Upgrade for more.");
      } else {
        await supabase.from('profiles').update({ image_limit: profile.image_limit - 1 }).eq('id', user.id);
      }
    }

    startGeneratingDots();
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
      } else alert("No image returned.");
    } catch (err) {
      alert("Image generation failed.");
    } finally {
      stopThinkingText();
    }
  });

  document.getElementById('saveMood').addEventListener('click', async () => {
    const mood = document.getElementById('activityInput').value;
    const imageSrc = document.getElementById('generatedImage').src;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !mood || !imageSrc) return alert("Log in, describe mood, and generate image first.");

    const { error } = await supabase.from('mia_logs').insert({
      user_id: user.id,
      mood_text: mood,
      image_url: imageSrc
    });
    error ? alert("Save failed.") : alert("Mood saved!");
  });
});
