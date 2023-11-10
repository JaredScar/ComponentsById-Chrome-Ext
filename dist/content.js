"use strict";
/// <reference path="./chrome.d.ts" />
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
                // Create a wrapper div for borders
                const borderWrapper = document.createElement('div');
                borderWrapper.classList.add('border-wrapper');
                // Add borders to the wrapper
                borderWrapper.style.position = 'absolute';
                borderWrapper.style.border = '2px solid red';
                borderWrapper.style.pointerEvents = 'none';
                borderWrapper.style.zIndex = '9999';
                // Add the wrapper to the DOM
                (_a = element.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(borderWrapper, element);
                borderWrapper.appendChild(element);
                // Create div for displaying ID
                const idDiv = document.createElement('div');
                idDiv.style.position = 'absolute';
                idDiv.style.color = 'red';
                idDiv.style.pointerEvents = 'none';
                idDiv.style.zIndex = '10000';
                idDiv.textContent = element.id;
                idDiv.classList.add('idDiv');
                // Add the ID div to the wrapper
                borderWrapper.appendChild(idDiv);
            }
        }
        else {
            // Remove borders from the element
            element.classList.remove('bordered-element');
            // Check if the element has a wrapper, and remove it
            const borderWrapper = element.closest('.border-wrapper');
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
