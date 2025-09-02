// SlopStopper popup.js
const toggle = document.getElementById('enableToggle');
const emojiToggle = document.getElementById('emojiToggle');
const braggingToggle = document.getElementById('braggingToggle');
const tagToggle = document.getElementById('tagToggle');

// Load current state from storage
chrome.storage.sync.get(['slopStopperEnabled', 'emojiCheckingEnabled', 'braggingSlopEnabled', 'tagSlopEnabled'], function(result) {
    toggle.checked = result.slopStopperEnabled !== false;
    emojiToggle.checked = result.emojiCheckingEnabled !== false;
    braggingToggle.checked = result.braggingSlopEnabled !== false;
    tagToggle.checked = result.tagSlopEnabled !== false;
    emojiToggle.disabled = !toggle.checked;
    braggingToggle.disabled = !toggle.checked;
    tagToggle.disabled = !toggle.checked;
});

toggle.addEventListener('change', function() {
    chrome.storage.sync.set({ slopStopperEnabled: toggle.checked });
    emojiToggle.disabled = !toggle.checked;
    braggingToggle.disabled = !toggle.checked;
    tagToggle.disabled = !toggle.checked;
});

emojiToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ emojiCheckingEnabled: emojiToggle.checked });
});

braggingToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ braggingSlopEnabled: braggingToggle.checked });
});

tagToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ tagSlopEnabled: tagToggle.checked });
});
