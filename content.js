class SlopStopper {
    constructor() {
        //this.emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]/gu;
        this.emojiRegex = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}\u{2190}-\u{21FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
        this.init();
    }

    init() {
        this.processFeedUpdates();
    }

    processFeedUpdates() {
        // Check if extension is enabled
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['slopStopperEnabled', 'emojiCheckingEnabled', 'braggingSlopEnabled', 'tagSlopEnabled', 'hiringSlopEnabled'], (result) => {
                const isEnabled = result.slopStopperEnabled !== false;

                if (isEnabled) {
                    // Get the main post containers
                    const feedUpdates = document.querySelectorAll('div[class*="feed-shared-update"][role="article"]:not(.slopstopper-processed)');

                    feedUpdates.forEach(feedDiv => {
                        this.processFeedUpdate(feedDiv, {
                            emojiCheckingEnabled: result.emojiCheckingEnabled !== false,
                            braggingSlopEnabled: result.braggingSlopEnabled !== false,
                            tagSlopEnabled: result.tagSlopEnabled !== false,
                            hiringSlopEnabled: result.hiringSlopEnabled !== false
                        });
                    });
                }
            });
        }

        setTimeout(() => {
            this.processFeedUpdates();
        }, 200);
    }

    processFeedUpdate(feedDiv, {
        emojiCheckingEnabled = true,
        braggingSlopEnabled = true,
        tagSlopEnabled = true,
        hiringSlopEnabled = true
    } = {}) {
        // Mark as processed to avoid reprocessing
        feedDiv.classList.add('slopstopper-processed');

        // Check for bragging slop
        if (braggingSlopEnabled && this.hasBraggingSlop(feedDiv)) {
            this.hidePostWithOverlay(feedDiv, 'bragging');
            return;
        }

        // Extract text content from the main post content AND possibly job card content
        const postContentArea = feedDiv.querySelector('.update-components-text');
        const jobCardContent = feedDiv.querySelector('.update-components-entity__description');
        const textContent = (postContentArea ? postContentArea.textContent || '' : '') +
            (jobCardContent ? ' ' + jobCardContent.textContent || '' : '');

        // Check for hiring slop (#hiring without "Remote")
        if (hiringSlopEnabled && this.isHiringSlop(textContent)) {
            this.hidePostWithOverlay(feedDiv, 'hiring');
            return;
        }

        // Check for tag slop (3+ hashtags)
        if (tagSlopEnabled && this.hashtagCount(textContent) > 3) {
            this.hidePostWithOverlay(feedDiv, 'tag');
            return;
        }

        // Check for emoji slop (2+ emojis)
        if (emojiCheckingEnabled && this.emojiCount(textContent) >= 2) {
            this.hidePostWithOverlay(feedDiv, 'emoji');
        }
    }

    emojiCount(text) {
        // Match all emojis in the text
        const matches = text.match(this.emojiRegex);
        return matches ? matches.length : 0;
    }

    hasBraggingSlop(feedDiv) {
        // Check for celebration/bragging images
        const celebrationImages = feedDiv.querySelectorAll('div[class^="feed-shared-celebration-image"]');
        return celebrationImages.length > 0;
    }

    hashtagCount(text) {
        // Match hashtags (#followed by word characters)
        const hashtagMatches = text.match(/#\w+/g);
        return hashtagMatches ? hashtagMatches.length : 0;
    }

    isHiringSlop(text) {
        // Check if post has #hiring hashtag but doesn't mention "Remote"
        const hasHiringHashtag = /#hiring/i.test(text);
        const hasRemote = /remote/i.test(text);
        return hasHiringHashtag && !hasRemote;
    }

    hidePostWithOverlay(feedDiv, reason) {
        // Create overlay div
        const overlay = document.createElement('div');
        overlay.className = 'slopstopper-overlay';

        // Create message text
        const messageText = document.createElement('div');
        messageText.className = 'slopstopper-message';
        if (reason == 'emoji') {
            messageText.textContent = 'Emoji Slop Hidden';
        } else if (reason == 'bragging') {
            messageText.textContent = 'Bragging Slop Hidden';
        } else if (reason == 'tag') {
            messageText.textContent = 'Tag Slop Hidden';
        } else if (reason == 'hiring') {
            messageText.textContent = 'Hiring Slop Hidden';
        } else {
            messageText.textContent = 'Unknown Slop Hidden';
        }

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
