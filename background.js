// Recursively collect all bookmark links from a tree node, typically the root node
function countBookmarksRecursively(node) {
    let count = 0;

    if (!node.children)
        return 1;

    for (const subNode of node.children) {
        count += countBookmarksRecursively(subNode);
    }

    return count;
}


function updateBookmarkCount() {
    chrome.bookmarks.getTree((rootNodes) => {
        let count = 0;

        // Counting logic: Start from bookmarks bar and count all bookmarks in DFS search
        for (const subNode of rootNodes) {
            count += countBookmarksRecursively(subNode);
        }

        // Display logic: Either the exact number (314) or approximation (62.8k) if count > 9999
        let displayCount;
        if (count > 9999) {
            let num_1000s = Math.floor(n / 1000);
            let num_100s = Math.floor((n % 1000) / 100);
            displayCount = `${num_1000s}.${num_100s}k`;
        } else {
            displayCount = `${count}`;
        }

        chrome.action.setBadgeText({ text: displayCount });
    });
}


// Setting to loading text until the recount is finished.
chrome.action.setBadgeText({ text: '.' });

// Trigger a manual recount when booting up the browser.
updateBookmarkCount();

// Add a manual way to trigger a recount if it's out-of-date for any reason.
chrome.action.onClicked.addListener(updateBookmarkCount);

// Trigger recounts for bookmark importing, creation, or deletion. This is inefficient as the entire bookmark
// library is recounted but that operation takes no more than a few milliseconds, so it's fine for 99.9% of people.
chrome.bookmarks.onCreated.addListener(updateBookmarkCount);
chrome.bookmarks.onImportEnded.addListener(updateBookmarkCount);
chrome.bookmarks.onRemoved.addListener(updateBookmarkCount);
