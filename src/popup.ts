/// <reference path="./chrome.d.ts" />

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton')!;
    const trackingInput = document.getElementById('trackingInput') as HTMLInputElement;

    chrome.storage.sync.get('trackingStrings', (data) => {
        const storedTrackingStrings = data.trackingStrings || [];
        trackingInput.value = storedTrackingStrings.join(',');
    });

    toggleButton.addEventListener('click', () => {
        const trackingStrings = trackingInput.value.split(',').map(str => str.trim());
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBorders', trackingStrings });
            }
        });

        chrome.storage.sync.set({ 'trackingStrings': trackingStrings });
    });
});
