<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mood Into Art</title>
  <link rel="stylesheet" href="/synthcalm/style.css"/>
  <style>
    #startVoice.recording {
      border-color: magenta;
      color: magenta;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>1. Press the "Start Voice" button and say what you feel. You have 60 Seconds. 2. Choose an art style. 3. Generate Image.</p>

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

    <hr style="border: none; border-top: 1px solid #0ff; margin: 20px 0;" />
    <p style="color:#0ff;font-size:14px;text-align:center;">Mood History</p>

    <div class="image-frame">
      <img id="generatedImage" style="display:none; max-width:100%;" />
    </div>

    <div id="moodHistory" style="min-height: 100px;"></div>
    <div id="thinking" style="display:none;text-align:center;color:#ff0;font-family:'Courier New', monospace;">Generating...</div>
  </div>

  <script>
    // Fix Local Time Display
    function updateDateTime() {
      const now = new Date();
      const options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatted = new Intl.DateTimeFormat('default', options).format(now);
      document.getElementById('dateTimeDisplay').textContent = formatted;
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // Generate Image Functionality
    document.getElementById("generate").addEventListener("click", async () => {
      const mood = document.getElementById("activityInput").value;
      const style = document.getElementById("styleSelect").value;
      const thinking = document.getElementById("thinking");
      const imageEl = document.getElementById("generatedImage");

      if (!mood || style === "none") {
        alert("Please enter your mood and select a style.");
        return;
      }

      thinking.style.display = "block";

      try {
        const response = await fetch("https://synthcalm.onrender.com/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: `${mood}, ${style}` })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.image) {
          imageEl.src = `data:image/png;base64,${data.image}`;
          imageEl.style.display = "block";
        } else {
          alert("No image returned.");
        }
      } catch (err) {
        console.error("Image generation error:", err);
        alert("Failed to generate image. Please try again later.");
      } finally {
        thinking.style.display = "none";
      }
    });

    // Clear Button Functionality
    document.getElementById("clear").addEventListener("click", () => {
      document.getElementById("activityInput").value = "";
      document.getElementById("styleSelect").value = "none";
      document.getElementById("generatedImage").style.display = "none";
    });
  </script>
</body>
</html>
