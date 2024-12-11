document.addEventListener('DOMContentLoaded', async () => {
    const prefixInput = document.getElementById('prefixInput');
    const subfolderInput = document.getElementById('subfolderInput');
    const maxSizeMBInput = document.getElementById('maxSizeMBInput');
    const autoCloseCheckbox = document.getElementById('autoCloseCheckbox');
    const statusMessage = document.getElementById('statusMessage');
    const saveBtn = document.getElementById('saveOptionsBtn');

    // Load settings from storage
    const { prefix, subfolder, maxSizeMB, autoClose } = await chrome.storage.sync.get(['prefix', 'subfolder', 'maxSizeMB', 'autoClose']);

    // Populate fields
    if (typeof prefix === 'string') prefixInput.value = prefix;
    if (typeof subfolder === 'string') subfolderInput.value = subfolder;
    if (typeof maxSizeMB === 'number') maxSizeMBInput.value = maxSizeMB;
    autoCloseCheckbox.checked = !!autoClose;

    saveBtn.addEventListener('click', async () => {
        const newPrefix = prefixInput.value.trim();
        const newSubfolder = subfolderInput.value.trim();
        const newMaxSizeMB = parseFloat(maxSizeMBInput.value);
        const newAutoClose = autoCloseCheckbox.checked;

        // Validate maxSizeMB (must be a non-negative number or blank)
        let maxSize = isNaN(newMaxSizeMB) ? null : newMaxSizeMB;
        if (maxSize !== null && maxSize < 0) maxSize = null;

        await chrome.storage.sync.set({
            prefix: newPrefix,
            subfolder: newSubfolder,
            maxSizeMB: maxSize,
            autoClose: newAutoClose
        });

        statusMessage.textContent = 'Options saved successfully!';
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 2000);
    });
});
