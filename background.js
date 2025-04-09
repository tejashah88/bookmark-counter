// Recursively collect all bookmark links from a parent node, starting from the root nodes
function countBookmarksRecursively(node) {
    let count = 0;

    if (!node.children)
        return 1;

    for (const subNode of node.children) {
        count += countBookmarksRecursively(subNode);
    }

    return count;
}


async function updateBookmarkCount() {
    const rootNodes = await chrome.bookmarks.getTree();
    let count = 0;

    // Counting logic: Start from bookmarks bar and count all bookmarks in DFS style
    for (const subNode of rootNodes) {
        count += countBookmarksRecursively(subNode);
    }

    // Display logic: Either the exact number (314) or approximation (62.8k) if count > 9999

    // NOTE: While most Chromium-based browsers allow for "unlimited" bookmarks, the vast
    // majority of people won't break past 10,000. Syncing bookmarks stops working anyways
    // at around 50k - 100k depending on the browser's sync engine.
    let displayCount;
    if (count > 9999) {
        let num_1000s = Math.floor(count / 1000);
        let num_100s = Math.floor((count % 1000) / 100);
        displayCount = `${num_1000s}.${num_100s}k`;
    } else {
        displayCount = `${count}`;
    }

    await chrome.action.setBadgeText({ text: displayCount });
}


// A wrapper function to allow logging for errors since async/await will create its own stack trace
function handleUpdatingBookmarkCount() {
    updateBookmarkCount().catch(err => console.error('Bookmark Counter Error:', err));
}

// Trigger a manual recount when booting up the browser.
handleUpdatingBookmarkCount();

// Add a way for the user to to trigger a manual recount if it's out-of-date for any reason.
chrome.action.onClicked.addListener(handleUpdatingBookmarkCount);

// Trigger a recount whenever bookmarks are imported, created, or deleted. This operation normally
// takes no more than a few milliseconds for ~2,000 bookmarks, so it's fine for 99.9% of people.

// NOTE: These are the only triggered events when the number of bookmarks changes. See the link below:
// Source: https://developer.chrome.com/docs/extensions/reference/api/bookmarks#event
chrome.bookmarks.onCreated.addListener(handleUpdatingBookmarkCount);
chrome.bookmarks.onImportEnded.addListener(handleUpdatingBookmarkCount);
chrome.bookmarks.onRemoved.addListener(handleUpdatingBookmarkCount);
