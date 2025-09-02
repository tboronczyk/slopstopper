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
            chrome.storage.sync.get(['slopStopperEnabled', 'emojiCheckingEnabled', 'braggingSlopEnabled', 'tagSlopEnabled', 'hiringSlopEnabled', 'keywordSlopEnabled', 'keywordList'], (result) => {
                const isEnabled = result.slopStopperEnabled !== false;

                if (isEnabled) {
                    // Get the main post containers
                    const feedUpdates = document.querySelectorAll('div[class*="feed-shared-update"][role="article"]:not(.slopstopper-processed)');

                    feedUpdates.forEach(feedDiv => {
                        this.processFeedUpdate(feedDiv, {
                            emojiCheckingEnabled: result.emojiCheckingEnabled !== false,
                            braggingSlopEnabled: result.braggingSlopEnabled !== false,
                            tagSlopEnabled: result.tagSlopEnabled !== false,
                            hiringSlopEnabled: result.hiringSlopEnabled !== false,
                            keywordSlopEnabled: result.keywordSlopEnabled !== false,
                            keywordList: result.keywordList || ''
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
        hiringSlopEnabled = true,
        keywordSlopEnabled = true,
        keywordList = ''
    } = {}) {
        // Mark as processed to avoid reprocessing
        feedDiv.classList.add('slopstopper-processed');

        // Check for bragging slop
        if (braggingSlopEnabled && this.hasBraggingSlop(feedDiv)) {
            this.hidePostWithOverlay(feedDiv, 'bragging');
            return;
        }

        // Extract all text content from the post, excluding user info
        const textContent = this.extractPostText(feedDiv);

        // Check for keyword slop
        if (keywordSlopEnabled && this.hasKeywordSlop(textContent, keywordList)) {
            this.hidePostWithOverlay(feedDiv, 'keyword');
            return;
        }

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

    extractPostText(feedDiv) {
        // Get all text content but exclude user info elements
        const excludeSelectors = [
            '.update-components-actor__title',
            '.update-components-actor__description', 
            '.update-components-actor__meta-link',
            '.update-components-actor__sub-description',
            '.update-components-actor__supplementary-actor-info'
        ];
        
        function shouldExcludeElement(element) {
            return excludeSelectors.some(selector => 
                element.matches && element.matches(selector) || 
                element.closest && element.closest(selector)
            );
        }
        
        function extractTextRecursively(node) {
            let text = '';
            
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || '';
            }
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip this element and its children if it matches exclusion criteria
                if (shouldExcludeElement(node)) {
                    return '';
                }
                
                // Recursively process child nodes
                for (let child of node.childNodes) {
                    text += extractTextRecursively(child);
                }
            }
            
            return text;
        }
        
        return extractTextRecursively(feedDiv);
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

    hasKeywordSlop(text, keywordList) {
        if (!keywordList || keywordList.trim() === '') {
            return false;
        }

        // Parse comma-separated keywords and clean them up
        const keywords = keywordList
            .split(',')
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => keyword.length > 0);

        if (keywords.length === 0) {
            return false;
        }

        const lowerText = text.toLowerCase();
        
        // Check if any keyword appears in the text
        return keywords.some(keyword => lowerText.includes(keyword));
    }

    hidePostWithOverlay(feedDiv, reason) {
        // Create overlay div
        const overlay = document.createElement('div');
        overlay.className = 'slopstopper-overlay';

        // Create message text
        const messageText = document.createElement('div');
        messageText.className = 'slopstopper-message';
        if (reason == 'keyword') {
            messageText.textContent = 'Keyword Slop Hidden';
        } else if (reason == 'emoji') {
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
