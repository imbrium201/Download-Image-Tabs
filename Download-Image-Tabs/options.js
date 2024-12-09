document.addEventListener('DOMContentLoaded', () => {
    // Load currently saved settings
    chrome.storage.sync.get(['subfolder', 'maxSizeMB', 'autoClose'], (result) => {
        document.getElementById('subfolderInput').value = result.subfolder || '';
        document.getElementById('maxSizeInput').value = (result.maxSizeMB !== undefined) ? result.maxSizeMB : '';
        document.getElementById('autoCloseCheckbox').checked = !!result.autoClose;
    });

    document.getElementById('saveOptions').addEventListener('click', () => {
        const subfolder = document.getElementById('subfolderInput').value.trim();
        const maxSizeMB = parseFloat(document.getElementById('maxSizeInput').value.trim());
        const autoClose = document.getElementById('autoCloseCheckbox').checked;

        chrome.storage.sync.set({
            subfolder: subfolder,
            maxSizeMB: isNaN(maxSizeMB) ? null : maxSizeMB,
            autoClose: autoClose
        }, () => {
            alert('Options saved.');
        });
    });
});
