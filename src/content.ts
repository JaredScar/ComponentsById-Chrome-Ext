/// <reference path="./chrome.d.ts" />
const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.type = 'text/css';
styleElement.href = chrome.extension.getURL('content.css');
(document.head || document.documentElement).appendChild(styleElement);
chrome.runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
        if (request.action === 'toggleBorders') {
            toggleBorders(request.trackingStrings);
        }
    }
);

let bordersEnabled = false;
let trackingStrings: string[] = [];

chrome.storage.sync.get('trackingStrings', (data) => {
    trackingStrings = data.trackingStrings || [];
});

function toggleBorders(newTrackingStrings: string[]) {
    bordersEnabled = !bordersEnabled;
    if (newTrackingStrings) {
        trackingStrings = newTrackingStrings;
    }
    updateBorders();
}

function updateBorders() {
    const elements = document.querySelectorAll('*');

    elements.forEach((element) => {
        if (bordersEnabled && matchesTrackingStrings(element.id)) {
            // Check if the element already has borders
            if (!element.classList.contains('bordered-element')) {
                // Add borders to the element
                element.classList.add('bordered-element');

                const header = document.createElement('div');

                // Set the content and styles for the header
                header.textContent = element.id;
                header.classList.add('cbi-header'); // Add your custom header class if needed

                // Insert the header before the target element
                element.parentNode?.insertBefore(header, element);
            }
        } else {
            // Remove borders from the element
            element.classList.remove('bordered-element');

            // Check if the element has a wrapper, and remove it
            const borderWrapper = element.closest('.cbi-header');
            if (borderWrapper) {
                borderWrapper.parentNode?.insertBefore(element, borderWrapper);
                borderWrapper.parentNode?.removeChild(borderWrapper);
            }
        }
    });
}






function matchesTrackingStrings(id: string): boolean {
    return trackingStrings.some(trackingString => id.includes(trackingString.trim()));
}
