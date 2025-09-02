// SlopStopper popup.js
const toggle = document.getElementById('enableToggle');
const emojiToggle = document.getElementById('emojiToggle');
const braggingToggle = document.getElementById('braggingToggle');
const tagToggle = document.getElementById('tagToggle');
const hiringToggle = document.getElementById('hiringToggle');
const keywordToggle = document.getElementById('keywordToggle');
const keywordInput = document.getElementById('keywordInput');

// Load current state from storage
chrome.storage.sync.get(['slopStopperEnabled', 'emojiCheckingEnabled', 'braggingSlopEnabled', 'tagSlopEnabled', 'hiringSlopEnabled', 'keywordSlopEnabled', 'keywordList'], function(result) {
    toggle.checked = result.slopStopperEnabled !== false;
    emojiToggle.checked = result.emojiCheckingEnabled !== false;
    braggingToggle.checked = result.braggingSlopEnabled !== false;
    tagToggle.checked = result.tagSlopEnabled !== false;
    hiringToggle.checked = result.hiringSlopEnabled !== false;
    keywordToggle.checked = result.keywordSlopEnabled !== false;
    keywordInput.value = result.keywordList || '';
    
    emojiToggle.disabled = !toggle.checked;
    braggingToggle.disabled = !toggle.checked;
    tagToggle.disabled = !toggle.checked;
    hiringToggle.disabled = !toggle.checked;
    keywordToggle.disabled = !toggle.checked;
    keywordInput.disabled = !toggle.checked || !keywordToggle.checked;
});

toggle.addEventListener('change', function() {
    chrome.storage.sync.set({ slopStopperEnabled: toggle.checked });
    emojiToggle.disabled = !toggle.checked;
    braggingToggle.disabled = !toggle.checked;
    tagToggle.disabled = !toggle.checked;
    hiringToggle.disabled = !toggle.checked;
    keywordToggle.disabled = !toggle.checked;
    keywordInput.disabled = !toggle.checked || !keywordToggle.checked;
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

hiringToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ hiringSlopEnabled: hiringToggle.checked });
});

keywordToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ keywordSlopEnabled: keywordToggle.checked });
    keywordInput.disabled = !toggle.checked || !keywordToggle.checked;
});

keywordInput.addEventListener('input', function() {
    chrome.storage.sync.set({ keywordList: keywordInput.value });
});
