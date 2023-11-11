"use strict";
/// <reference path="./chrome.d.ts" />
const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.type = 'text/css';
styleElement.href = chrome.extension.getURL('content.css');
(document.head || document.documentElement).appendChild(styleElement);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleBorders') {
        toggleBorders(request.trackingStrings);
    }
});
let bordersEnabled = false;
let trackingStrings = [];
chrome.storage.sync.get('trackingStrings', (data) => {
    trackingStrings = data.trackingStrings || [];
});
function toggleBorders(newTrackingStrings) {
    bordersEnabled = !bordersEnabled;
    if (newTrackingStrings) {
        trackingStrings = newTrackingStrings;
    }
    updateBorders();
}
function updateBorders() {
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
        var _a, _b, _c;
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
                (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(header, element);
            }
        }
        else {
            // Remove borders from the element
            element.classList.remove('bordered-element');
            // Check if the element has a wrapper, and remove it
            const borderWrapper = element.closest('.cbi-header');
            if (borderWrapper) {
                (_b = borderWrapper.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(element, borderWrapper);
                (_c = borderWrapper.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(borderWrapper);
            }
        }
    });
}
function matchesTrackingStrings(id) {
    return trackingStrings.some(trackingString => id.includes(trackingString.trim()));
}
