class SlopStopper {
    constructor() {
    this.emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/gu;
        this.init();
    }

    init() {
        console.log('SlopStopper initialized');
        this.processFeedUpdates();
    }

    processFeedUpdates() {
        // Get only the main post containers
        const feedUpdates = document.querySelectorAll('div[class*="feed-shared-update"][role="article"]:not(.slopstopper-processed)');
        
        feedUpdates.forEach(feedDiv => {
            this.processFeedUpdate(feedDiv);
        });

        setTimeout(() => {
            this.processFeedUpdates();
        }, 200);
    }

    processFeedUpdate(feedDiv) {
        // Mark as processed to avoid reprocessing
        feedDiv.classList.add('slopstopper-processed');

        // Extract text content from the main post content only (exclude author names, headers, etc.)
        const postContentArea = feedDiv.querySelector('.update-components-text');
        const textContent = postContentArea ? postContentArea.textContent || '' : '';

        // If the text contains two or more emojis then it's slop
        if (this.emojiCount(textContent) >= 2) {
            this.hidePostWithOverlay(feedDiv);
        }
    }


    emojiCount(text) {
        // Match all emojis in the text
        const matches = text.match(this.emojiRegex);
        return matches ? matches.length : 0;
    }

    hidePostWithOverlay(feedDiv) {
        // Create overlay div
        const overlay = document.createElement('div');
        overlay.className = 'slopstopper-overlay';
        
        // Create message text
        const messageText = document.createElement('div');
        messageText.className = 'slopstopper-message';
        messageText.textContent = 'Slop Hidden';
        
        // Create unhide button
        const unhideButton = document.createElement('button');
        unhideButton.className = 'slopstopper-unhide-btn';
        unhideButton.textContent = 'Unhide';
        unhideButton.addEventListener('click', () => {
            this.unhidePost(feedDiv, overlay);
        });

        // Assemble overlay
        overlay.appendChild(messageText);
        overlay.appendChild(unhideButton);

        // Hide original content
        this.hideOriginalContent(feedDiv);

        // Attach overlay to the feed div
        feedDiv.appendChild(overlay);
        feedDiv.classList.add('slopstopper-hidden');
    }

    hideOriginalContent(feedDiv) {
        // Hide all direct children except our overlay
        Array.from(feedDiv.children).forEach(child => {
            if (!child.classList.contains('slopstopper-overlay')) {
                child.style.display = 'none';
                child.classList.add('slopstopper-hidden-content');
            }
        });
    }

    unhidePost(feedDiv, overlay) {
        // Show all hidden content
        const hiddenContent = feedDiv.querySelectorAll('.slopstopper-hidden-content');
        hiddenContent.forEach(element => {
            element.style.display = '';
            element.classList.remove('slopstopper-hidden-content');
        });

        // Remove overlay
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }

        // Remove hidden class
        feedDiv.classList.remove('slopstopper-hidden');
    }
}

    new SlopStopper();
