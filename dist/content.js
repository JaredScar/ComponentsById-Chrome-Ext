"use strict";
/// <reference path="./chrome.d.ts" />
const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.type = 'text/css';
styleElement.href = chrome.extension.getURL('content.css');
(document.head || document.documentElement).appendChild(styleElement);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var _a;
    switch (request.action) {
        case 'toggleBorders': {
            toggleBorders(request.data);
            break;
        }
        case 'scrollToComp': {
            (_a = document.getElementById(request.data)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
            break;
        }
        case 'bolderComp': {
            const elem = document.getElementById(request.data);
            if (elem) {
                const oldBorder = elem.style.borderWidth;
                elem.style.borderWidth = '4px';
                setTimeout(() => {
                    elem.style.borderWidth = oldBorder;
                }, 3000);
            }
            break;
        }
    }
});
let bordersEnabled = false;
let trackingStrings = [];
let compIds = [];
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
function getRandomColor() {
    // Generate random values for red, green, and blue components
    const randomRed = Math.floor(Math.random() * 256);
    const randomGreen = Math.floor(Math.random() * 256);
    const randomBlue = Math.floor(Math.random() * 256);
    // Construct the RGB color string
    const randomColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;
    return randomColor;
}
let oldBorderColors = {};
function updateBorders() {
    compIds = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
        const htmlEle = element;
        if (bordersEnabled && matchesTrackingStrings(element.id) && htmlEle.style.display != 'none') {
            // Check if the element already has borders
            oldBorderColors[htmlEle.id] = htmlEle.style.borderColor;
            let ele = document.createElement("div");
            let parentEle = element.parentElement;
            if (parentEle != null) {
                ele.classList.add("bordered-element");
                parentEle.insertBefore(ele, element);
                ele.appendChild(element);
            }
            else {
                if (!element.classList.contains('bordered-element')) {
                    // Add borders to the element
                    element.classList.add('bordered-element');
                }
            }
            const randCol = getRandomColor();
            htmlEle.style.borderColor = randCol + "";
            compIds.push({ id: element.id, color: randCol });
        }
        else {
            // Remove borders from the element
            const htmlEle = element;
            const oldColor = oldBorderColors[htmlEle.id];
            if (oldColor)
                htmlEle.style.borderColor = oldColor;
            else
                htmlEle.style.borderColor = '';
            element.classList.remove('bordered-element');
        }
    });
    sendMessage({ action: "transferMatchingIds", data: compIds });
}
function sendMessage(message) {
    chrome.runtime.sendMessage(message);
}
function matchesTrackingStrings(id) {
    return trackingStrings.some(trackingString => id.includes(trackingString.trim()));
}
