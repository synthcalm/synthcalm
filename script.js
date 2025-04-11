body {
  font-family: 'Courier New', monospace;
  margin: 0;
  background: #000;
  color: #0ff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  flex-direction: column;
}

.container {
  width: 90%;
  max-width: 600px;
  padding: 20px;
  border: 2px solid #0ff;
  border-radius: 12px;
}

canvas#waveform {
  width: 100%;
  height: 160px;
  background-color: #000;
  border: 1px solid #0ff;
  background-image: linear-gradient(to right, rgba(255, 255, 0, 0.3) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 0, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
}

.footer-bar {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin: 10px 0;
}

textarea,
.button,
select#styleSelect {
  width: 100%;
  background: #000;
  border: 2px solid #0ff;
  color: #0ff;
  padding: 10px;
  margin-bottom: 10px;
  text-align: center;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-transform: uppercase;
}

textarea#activityInput {
  max-width: 100%;
  min-height: 60px;
  resize: none;
  overflow-wrap: break-word;
  font-size: 14px;
  text-transform: none;
}

select#styleSelect {
  text-align: center;
  text-align-last: center;
  -webkit-text-align-last: center;
  -moz-text-align-last: center;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-position: right 10px center;
  background-repeat: no-repeat;
  padding-right: 30px;
  padding-left: 10px;
  line-height: normal;
  display: block;
  box-sizing: border-box;
  cursor: pointer;
}

select#styleSelect option {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #000;
  color: #0ff;
  text-transform: uppercase;
}

select#styleSelect:hover {
  background: #0ff;
  color: #000;
}

.button-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.button {
  cursor: pointer;
}

.button.recording {
  background: #000 !important;
  border-color: #ff00ff !important;
  color: #0ff !important;
}

.button:hover {
  background: #0ff;
  color: #000;
}

.seven-segment {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.image-frame {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

#generatedImage {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: none;
  border: 2px solid #0ff;
}

#thinking {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ff0;
  text-align: center;
  margin-top: 5px;
  margin-bottom: 10px;
  height: 20px;
  display: none; /* IMPORTANT: hidden by default */
}

#moodHistory {
  margin-top: 10px;
  font-size: 13px;
  color: #0ff;
  text-align: center;
}

.history-entry {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px;
  gap: 8px;
}

.history-entry img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}

.history-entry button {
  background: transparent;
  border: 1px solid #0ff;
  color: #0ff;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 12px;
}

.history-entry button:hover {
  background: #0ff;
  color: #000;
}

@keyframes soft-blink {
  0% { border-color: #0ff; }
  50% { border-color: #ffff00; }
  100% { border-color: #0ff; }
}

select#styleSelect.blink-yellow,
.button.blink-yellow {
  animation: soft-blink 1.5s infinite ease-in-out !important;
}

.highlight-yellow {
  border-color: #ffff00 !important;
  color: #0ff;
}

#thinking.highlight-yellow {
  color: #ffff00 !important;
}
