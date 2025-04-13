// Updated script.js — replaces deprecated ScriptProcessorNode with AudioWorkletNode, and enables real DALL·E image generation.

window.addEventListener('DOMContentLoaded', async () => {
  const micBtn = document.getElementById('startVoice');
  const redoBtn = document.getElementById('redo');
  const generateBtn = document.getElementById('generate');
  const saveBtn = document.getElementById('saveImage');
  const styleSelect = document.getElementById('styleSelect');
  const moodInput = document.getElementById('activityInput');
  const imageEl = document.getElementById('generatedImage');
  const moodHistoryEl = document.getElementById('moodHistory');
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');
  const timerEl = document.getElementById('countdown-timer');
  const canvas = document.getElementById('waveform');
  const ctx = canvas.getContext('2d');

  let stream, audioContext, workletNode, source;
  let startTime = Date.now();

  function updateClock() {
    const now = new Date();
    dateEl.textContent = now.toISOString().split('T')[0];
    timeEl.textContent = now.toTimeString().split(' ')[0];
    const remaining = Math.max(0, 3600 - Math.floor((Date.now() - startTime) / 1000));
    timerEl.textContent = `Session Ends In: ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  async function startRecording() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext({ sampleRate: 16000 });
      await audioContext.audioWorklet.addModule('data:application/javascript;base64,' + btoa(`
        class PCMProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            if (!input) return true;
            const int16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              int16[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
            }
            this.port.postMessage(int16.buffer);
            return true;
          }
        }
        registerProcessor('pcm-processor', PCMProcessor);
      `));

      source = audioContext.createMediaStreamSource(stream);
      workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      drawWaveform(analyser, dataArray);

      source.connect(workletNode).connect(audioContext.destination);

      // Connect to AssemblyAI WebSocket (assumes secure token flow from backend)
      const tokenRes = await fetch('https://roy-chatbo-backend.onrender.com/api/assembly/token');
      const { token } = await tokenRes.json();
      const socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`);
      socket.binaryType = 'arraybuffer';

      socket.onopen = () => socket.send(JSON.stringify({ token }));
      socket.onmessage = (msg) => {
        const { text } = JSON.parse(msg.data);
        if (text) moodInput.value = text;
      };

      workletNode.port.onmessage = (e) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(e.data);
      };

      micBtn.disabled = true;
    } catch (e) {
      console.error(e);
    }
  }

  function drawWaveform(analyser, dataArray) {
    requestAnimationFrame(() => drawWaveform(analyser, dataArray));
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const sliceWidth = canvas.width / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const y = (dataArray[i] / 128.0) * canvas.height / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }

  async function generateImage(prompt, style) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
        },
        body: JSON.stringify({
          prompt: `${prompt}, in the style of ${style}`,
          n: 1,
          size: '512x512'
        })
      });
      const data = await res.json();
      imageEl.src = data.data[0].url;
      saveBtn.disabled = false;
    } catch (e) {
      console.error('Image generation failed:', e);
    }
  }

  generateBtn.addEventListener('click', () => {
    const prompt = moodInput.value.trim();
    const style = styleSelect.value;
    if (!prompt || !style) return;
    generateImage(prompt, style);
  });

  redoBtn.addEventListener('click', () => {
    moodInput.value = '';
    imageEl.src = '';
    saveBtn.disabled = true;
  });

  saveBtn.addEventListener('click', () => {
    const moodText = moodInput.value.trim();
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const div = document.createElement('div');
    div.textContent = `${timestamp}: ${moodText}`;
    moodHistoryEl.appendChild(div);
    redoBtn.click();
  });

  micBtn.addEventListener('click', startRecording);
});
