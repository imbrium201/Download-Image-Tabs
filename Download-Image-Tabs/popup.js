document.getElementById('downloadBtn').addEventListener('click', async () => {
    const prefix = document.getElementById('prefixInput').value.trim();

    // Retrieve configured settings
    const storageData = await chrome.storage.sync.get(['subfolder', 'maxSizeMB', 'autoClose']);
    const subfolder = (storageData.subfolder || '').trim();
    const maxSizeMB = storageData.maxSizeMB;
    const autoClose = !!storageData.autoClose;

    const tabs = await chrome.tabs.query({});
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];
    const imageTabs = tabs.filter(tab => {
        if (tab.url) {
            const lowerUrl = tab.url.toLowerCase();
            return imageExtensions.some(ext => lowerUrl.endsWith(ext));
        }
        return false;
    });

    if (imageTabs.length === 0) {
        alert('No image-only tabs found.');
        return;
    }

    let downloadedCount = 0;

    for (const tab of imageTabs) {
        try {
            // Get filename
            const url = new URL(tab.url);
            let fileName = url.pathname.split('/').pop() || 'image' + Math.floor(Math.random() * 100000) + '.png';
            if (prefix) {
                fileName = prefix + '_' + fileName;
            }

            let finalName = fileName;
            if (subfolder) {
                finalName = subfolder + '/' + fileName;
            }

            // Check file size if maxSizeMB is set
            if (maxSizeMB && maxSizeMB > 0) {
                const headResp = await fetch(tab.url, { method: 'HEAD' });
                if (headResp.ok) {
                    const contentLength = headResp.headers.get('Content-Length');
                    if (contentLength) {
                        const fileSizeMB = parseFloat(contentLength) / (1024 * 1024);
                        if (fileSizeMB > maxSizeMB) {
                            console.log(`Skipping ${tab.url} because it's larger than the max allowed size (${maxSizeMB} MB).`);
                            continue;
                        }
                    }
                }
            }

            await chrome.downloads.download({
                url: tab.url,
                filename: finalName,
                saveAs: false
            });

            downloadedCount++;

            // If autoClose is enabled, close the tab after download
            if (autoClose) {
                await chrome.tabs.remove(tab.id);
            }

        } catch (e) {
            console.error('Failed to download:', tab.url, e);
        }
    }

    alert(`Downloaded ${downloadedCount} image(s).`);
});

// Options link
document.getElementById('optionsLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await chrome.runtime.openOptionsPage();
});
