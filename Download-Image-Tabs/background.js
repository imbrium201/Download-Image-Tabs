// List of known image extensions
const KNOWN_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

chrome.action.onClicked.addListener(async () => {
    // Retrieve user settings from storage
    const { subfolder = '', maxSizeMB, autoClose, prefix = '' } = await chrome.storage.sync.get(['subfolder', 'maxSizeMB', 'autoClose', 'prefix']);

    // Query all tabs in the current window (or you can remove currentWindow: true if you want all windows)
    const tabs = await chrome.tabs.query({ currentWindow: true });

    let downloadedCount = 0;

    for (const tab of tabs) {
        if (!tab.url) continue;

        const extension = isImageUrl(tab.url);
        if (!extension) {
            // Not a recognized image, skip
            continue;
        }

        // Construct filename
        const url = new URL(tab.url);
        let fileName = url.pathname.split('/').pop() || ('image' + Math.floor(Math.random() * 100000) + extension);
        if (prefix) {
            fileName = prefix + '_' + fileName;
        }
        let finalName = fileName;
        if (subfolder) {
            finalName = subfolder + '/' + fileName;
        }

        // Check file size if maxSizeMB is set and > 0
        let skipDueToSize = false;
        if (maxSizeMB && maxSizeMB > 0) {
            try {
                const headResp = await fetch(tab.url, { method: 'HEAD' });
                if (headResp.ok) {
                    const contentLength = headResp.headers.get('content-length');
                    if (contentLength) {
                        const fileSizeMB = parseFloat(contentLength) / (1024 * 1024);
                        if (fileSizeMB > maxSizeMB) {
                            console.log(`Skipping ${tab.url}: size (${fileSizeMB.toFixed(2)} MB) > ${maxSizeMB} MB limit.`);
                            skipDueToSize = true;
                        }
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch headers for size check:', tab.url, e);
            }
        }

        if (skipDueToSize) continue;

        // Download the image
        try {
            await chrome.downloads.download({
                url: tab.url,
                filename: finalName,
                saveAs: false
            });
            downloadedCount++;

            // If autoClose is enabled, close the tab after download
            if (autoClose && tab.id) {
                await chrome.tabs.remove(tab.id);
            }
        } catch (e) {
            console.error('Failed to download:', tab.url, e);
        }
    }

    // Log a message summarizing the result
    if (downloadedCount === 0) {
        console.log('No image-only tabs found or no downloads occurred.');
    } else {
        console.log(`Downloaded ${downloadedCount} image(s).`);
    }
});

function isImageUrl(url) {
    // Remove query parameters
    const cleanUrl = url.split('?')[0].toLowerCase();

    // Check if the URL ends with a known image extension
    for (let ext of KNOWN_IMAGE_EXTENSIONS) {
        if (cleanUrl.endsWith(ext)) {
            return ext;
        }
    }

    return null;
}