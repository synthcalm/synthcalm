<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mood Into Art</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #000;
      color: #0ff;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .instructions {
      text-align: center;
      margin-bottom: 20px;
      font-size: 16px;
    }
    
    .seven-segment {
      font-family: 'Courier New', monospace;
      background-color: #111;
      padding: 5px 10px;
      border-radius: 4px;
      color: #0ff;
    }
    
    .footer-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      background-color: #111;
      padding: 10px;
      border-radius: 4px;
    }
    
    #waveform {
      width: 100%;
      height: 80px;
      background-color: #111;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    textarea {
      width: 100%;
      padding: 12px;
      border: 1px solid #0ff;
      border-radius: 4px;
      background-color: #111;
      color: #0ff;
      font-size: 16px;
      margin-bottom: 20px;
      resize: vertical;
    }
    
    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .button {
      padding: 10px 15px;
      border: 1px solid #0ff;
      background-color: transparent;
      color: #0ff;
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .button:hover {
      background-color: rgba(0, 255, 255, 0.1);
    }
    
    #startVoice.recording {
      border-color: magenta;
      color: magenta;
      background-color: rgba(255, 0, 255, 0.1);
    }
    
    select {
      padding: 10px 15px;
      border: 1px solid #0ff;
      background-color: #111;
      color: #0ff;
      border-radius: 4px;
      font-size: 14px;
      min-width: 150px;
    }
    
    .image-frame {
      margin: 20px 0;
      min-height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px dashed #0ff;
      padding: 10px;
      border-radius: 4px;
    }
    
    #generatedImage {
      max-width: 100%;
      max-height: 500px;
      display: none;
    }
    
    #thinking {
      padding: 10px;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      0% { opacity: 0.2; }
      50% { opacity: 1; }
      100% { opacity: 0.2; }
    }
    
    .mood-entry {
      background-color: #111;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 4px;
    }
    
    .mood-entry img {
      margin-top: 10px;
      border: 1px solid #0ff;
    }
    
    hr {
      border: none;
      border-top: 1px solid #0ff;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="instructions">
      <p>1. Press the "Start Voice" button and say what you feel. You have 60 Seconds. 2. Choose an art style. 3. Generate Image.</p>
    </div>

    <canvas id="waveform"></canvas>

    <div class="footer-bar">
      <div id="dateTimeDisplay" class="seven-segment"></div>
      <div id="countdownDisplay" class="seven-segment">00:60</div>
    </div>

    <textarea id="activityInput" rows="4" placeholder="Describe your mood... (editable after recording)"></textarea>

    <div class="button-group">
      <button class="button" id="startVoice">Start Voice</button>
      <button class="button" id="clear">Clear</button>
      <select id="styleSelect">
        <option value="none" selected disabled>Choose Style</option>
        <option value="photo">Hyper-realistic Photo</option>
        <option value="anime">Japanese Anime Style</option>
        <option value="abstract">Abstract</option>
        <option value="surrealism">Surrealism</option>
        <option value="post-modern">Post-modern</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="arabic-calligraphy">Arabic Calligraphy</option>
        <option value="chinese-calligraphy">Chinese Calligraphy</option>
        <option value="japanese-calligraphy">Japanese Calligraphy</option>
        <option value="marvel">Marvel Comic</option>
        <option value="art-deco">Art Deco</option>
        <option value="impressionist">Impressionist</option>
        <option value="pop-art">Pop Art</option>
        <option value="digital-painting">Digital Painting</option>
        <option value="minimalism">Minimalism</option>
      </select>
      <button class="button" id="generate">Generate Image</button>
      <button class="button" id="saveMood">Save</button>
      <button class="button" onclick="window.location.href='https://synthcalm.com'">Return to SynthCalm</button>
    </div>

    <hr />
    <p style="text-align:center;">Mood History</p>

    <div class="image-frame">
      <img id="generatedImage" alt="Generated mood art" />
      <div id="thinking" style="display:none;text-align:center;color:#ff0;font-family:'Courier New', monospace;">Generating...</div>
    </div>

    <div id="moodHistory" style="min-height: 100px;"></div>
  </div>

  <script>
    // Date and Time Display
    function updateDateTime() {
      const now = new Date();
      const options = {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatted = new Intl.DateTimeFormat('en-US', options).format(now);
      document.getElementById('dateTimeDisplay').textContent = formatted;
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();
    
    // Voice Recording and Waveform Visualization
    const startVoiceBtn = document.getElementById("startVoice");
    const countdownDisplay = document.getElementById("countdownDisplay");
    const activityInput = document.getElementById("activityInput");
    const waveformCanvas = document.getElementById("waveform");
    const waveformCtx = waveformCanvas.getContext("2d");
    
    let audioStream;
    let audioContext;
    let audioAnalyser;
    let audioDataArray;
    let recordingInterval;
    let countdownInterval;
    let secondsLeft = 60;
    let isRecording = false;
    
    // Set canvas dimensions
    function setupCanvas() {
      waveformCanvas.width = waveformCanvas.offsetWidth;
      waveformCanvas.height = waveformCanvas.offsetHeight;
      
      // Initial clear
      waveformCtx.fillStyle = "#111";
      waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
    }
    
    window.addEventListener('resize', setupCanvas);
    setupCanvas();
    
    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (transcript.trim() !== '') {
          activityInput.value = transcript.trim();
        }
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Ignore no-speech errors as they're common
          return;
        }
        alert(`Speech recognition error: ${event.error}`);
      };
    } else {
      startVoiceBtn.disabled = true;
      startVoiceBtn.textContent = "Browser not supported";
      console.error("Speech recognition not supported in this browser");
    }
    
    // Start/Stop Recording
    startVoiceBtn.addEventListener("click", toggleRecording);
    
    async function toggleRecording() {
      if (isRecording) {
        stopRecording();
      } else {
        await startRecording();
      }
    }
    
    async function startRecording() {
      try {
        // Reset and prepare for recording
        activityInput.value = "";
        secondsLeft = 60;
        updateCountdown();
        
        // Get audio stream
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Setup audio context and analyzer for waveform
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(audioStream);
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 256;
        source.connect(audioAnalyser);
        
        audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
        
        // Start waveform visualization
        recordingInterval = setInterval(drawWaveform, 50);
        
        // Start speech recognition
        if (recognition) {
          recognition.start();
        }
        
        // Start countdown
        countdownInterval = setInterval(() => {
          secondsLeft--;
          updateCountdown();
          
          if (secondsLeft <= 0) {
            stopRecording();
          }
        }, 1000);
        
        // Update UI
        isRecording = true;
        startVoiceBtn.classList.add("recording");
        startVoiceBtn.textContent = "Stop Recording";
        
      } catch (err) {
        console.error("Error starting recording:", err);
        alert("Could not access your microphone. Please check permissions.");
      }
    }
    
    function stopRecording() {
      // Stop countdown
      clearInterval(countdownInterval);
      
      // Stop waveform visualization
      clearInterval(recordingInterval);
      
      // Stop audio stream
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      
      // Stop speech recognition
      if (recognition) {
        recognition.stop();
      }
      
      // Clear waveform
      waveformCtx.fillStyle = "#111";
      waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      
      // Update UI
      isRecording = false;
      startVoiceBtn.classList.remove("recording");
      startVoiceBtn.textContent = "Start Voice";
      
      // If no text was captured, provide feedback
      if (!activityInput.value.trim()) {
        activityInput.value = "No speech detected. Please type your mood here.";
      }
    }
    
    function drawWaveform() {
      if (!audioAnalyser) return;
      
      // Get audio data
      audioAnalyser.getByteTimeDomainData(audioDataArray);
      
      // Clear canvas
      waveformCtx.fillStyle = "#111";
      waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      
      // Draw waveform
      waveformCtx.lineWidth = 2;
      waveformCtx.strokeStyle = "#0ff";
      waveformCtx.beginPath();
      
      const sliceWidth = waveformCanvas.width / audioDataArray.length;
      let x = 0;
      
      for (let i = 0; i < audioDataArray.length; i++) {
        const v = audioDataArray[i] / 128.0;
        const y = v * waveformCanvas.height / 2;
        
        if (i === 0) {
          waveformCtx.moveTo(x, y);
        } else {
          waveformCtx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      waveformCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2);
      waveformCtx.stroke();
    }
    
    function updateCountdown() {
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      countdownDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    
    // Image Generation integrated with server
    document.getElementById("generate").addEventListener("click", generateImage);
    
    async function generateImage() {
      const mood = activityInput.value.trim();
      const style = document.getElementById("styleSelect").value;
      const thinking = document.getElementById("thinking");
      const imageEl = document.getElementById("generatedImage");
      
      if (!mood || style === "none") {
        alert("Please enter your mood and select a style.");
        return;
      }
      
      thinking.style.display = "block";
      imageEl.style.display = "none";
      
      try {
        // Create the prompt that combines mood and style
        const prompt = `Create an image based on the mood: "${mood}" in ${style} style.`;
        
        // Get the API endpoint (adjust URL based on where your server is hosted)
        const apiUrl = '/generate'; // Change this if your server is at a different URL
        
        // Make API request to your server endpoint
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Server error: ${errorData.error || response.status}`);
        }
        
        const responseData = await response.json();
        
        if (responseData.image) {
          imageEl.src = `data:image/png;base64,${responseData.image}`;
          imageEl.style.display = "block";
        } else {
          throw new Error("No image returned from the server");
        }
      } catch (err) {
        console.error("Image generation error:", err);
        alert("Failed to generate image. " + err.message);
        
        // Create fallback SVG for visualization
        const svgContent = generateMoodSVG(mood, style);
        imageEl.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
        imageEl.style.display = "block";
      } finally {
        thinking.style.display = "none";
      }
    }
    
    // Generate placeholder SVG based on mood and style
    function generateMoodSVG(mood, style) {
      // Extract emotion from mood text
      let emotion = "neutral";
      
      const emotions = {
        "happy": "#FFC107",
        "joy": "#FFC107",
        "sad": "#2196F3",
        "depressed": "#2196F3",
        "angry": "#F44336",
        "frustrated": "#F44336",
        "calm": "#4CAF50",
        "peaceful": "#4CAF50",
        "excited": "#E91E63",
        "anxious": "#9C27B0",
        "stressed": "#9C27B0",
        "tired": "#607D8B",
        "exhausted": "#607D8B",
        "neutral": "#9E9E9E"
      };
      
      // Determine dominant emotion
      for (const [key, _] of Object.entries(emotions)) {
        if (mood.toLowerCase().includes(key)) {
          emotion = key;
          break;
        }
      }
      
      const color = emotions[emotion];
      
      // Different patterns based on style
      let pattern;
      
      switch(style) {
        case "abstract":
          pattern = `
            <rect x="100" y="100" width="800" height="800" fill="${color}" opacity="0.3" />
            <circle cx="500" cy="500" r="300" fill="${color}" opacity="0.5" />
            <path d="M200,200 L800,800 M800,200 L200,800" stroke="${color}" stroke-width="20" />
          `;
          break;
        case "minimalism":
          pattern = `
            <circle cx="500" cy="500" r="250" fill="${color}" />
          `;
          break;
        case "cyberpunk":
          pattern = `
            <rect x="0" y="0" width="1000" height="1000" fill="#111" />
            <path d="M0,300 L1000,300 M0,700 L1000,700" stroke="${color}" stroke-width="30" />
            <rect x="300" y="400" width="400" height="200" fill="${color}" opacity="0.7" />
            <text x="500" y="530" font-family="monospace" font-size="50" fill="#000" text-anchor="middle">${emotion.toUpperCase()}</text>
          `;
          break;
        case "impressionist":
          // Create random dots
          let dots = '';
          for (let i = 0; i < 300; i++) {
            const x = Math.random() * 1000;
            const y = Math.random() * 1000;
            const r = Math.random() * 30 + 5;
            const opacity = Math.random() * 0.8 + 0.2;
            dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}" />`;
          }
          pattern = dots;
          break;
        case "pop-art":
          pattern = `
            <rect x="0" y="0" width="500" height="500" fill="#FF0000" />
            <rect x="500" y="0" width="500" height="500" fill="#0000FF" />
            <rect x="0" y="500" width="500" height="500" fill="#FFFF00" />
            <rect x="500" y="500" width="500" height="500" fill="${color}" />
            <circle cx="500" cy="500" r="200" fill="white" />
            <text x="500" y="520" font-family="Arial" font-size="70" font-weight="bold" fill="#000" text-anchor="middle">${emotion.toUpperCase()}</text>
          `;
          break;
        default:
          // Default pattern
          pattern = `
            <rect x="100" y="100" width="800" height="800" fill="${color}" opacity="0.2" />
            <circle cx="500" cy="500" r="300" stroke="${color}" stroke-width="10" fill="none" />
            <text x="500" y="520" font-family="Arial" font-size="60" fill="${color}" text-anchor="middle">${emotion.toUpperCase()}</text>
          `;
      }
      
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
        <rect width="1000" height="1000" fill="#111" />
        ${pattern}
        <text x="500" y="950" font-family="Arial" font-size="24" fill="#fff" text-anchor="middle">Mood: ${emotion} in ${style} style</text>
      </svg>
      `;
    }
    
    // Save Mood
    document.getElementById("saveMood").addEventListener("click", saveMood);
    
    function saveMood() {
      const mood = activityInput.value.trim();
      const style = document.getElementById("styleSelect").value;
      const imageEl = document.getElementById("generatedImage");
      
      if (!mood) {
        alert("Please enter your mood before saving.");
        return;
      }
      
      const timestamp = new Date().toLocaleString();
      const imageSrc = imageEl.style.display !== "none" ? imageEl.src : "";
      
      // Create mood history entry
      const historyEntry = document.createElement("div");
      historyEntry.classList.add("mood-entry");
      historyEntry.innerHTML = `
        <p><strong>${timestamp}</strong>: ${mood}</p>
        ${imageSrc ? `<img src="${imageSrc}" alt="Mood art" style="max-width:200px;max-height:150px;">` : ''}
        <hr>
      `;
      
      // Add to history
      document.getElementById("moodHistory").prepend(historyEntry);
      
      // Save to localStorage
      try {
        // Get existing history from localStorage
        const savedMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        
        // Add new mood
        savedMoods.unshift({
          timestamp,
          mood,
          style,
          imageSrc
        });
        
        // Keep only the last 20 entries to prevent localStorage from getting too large
        if (savedMoods.length > 20) {
          savedMoods.length = 20;
        }
        
        // Save back to localStorage
        localStorage.setItem('moodHistory', JSON.stringify(savedMoods));
        
        console.log("Mood saved to localStorage");
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }
    }
    
    // Clear Button
    document.getElementById("clear").addEventListener("click", () => {
      activityInput.value = "";
      document.getElementById("styleSelect").value = "none";
      document.getElementById("generatedImage").style.display = "none";
    });
    
    // Load saved moods from localStorage on page load
    document.addEventListener('DOMContentLoaded', () => {
      try {
        const savedMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const historyContainer = document.getElementById("moodHistory");
        
        savedMoods.forEach(item => {
          const historyEntry = document.createElement("div");
          historyEntry.classList.add("mood-entry");
          historyEntry.innerHTML = `
            <p><strong>${item.timestamp}</strong>: ${item.mood}</p>
            ${item.imageSrc ? `<img src="${item.imageSrc}" alt="Mood art" style="max-width:200px;max-height:150px;">` : ''}
            <hr>
          `;
          historyContainer.appendChild(historyEntry);
        });
      } catch (err) {
        console.error("Error loading moods from localStorage:", err);
      }
    });
  </script>
</body>
</html>
