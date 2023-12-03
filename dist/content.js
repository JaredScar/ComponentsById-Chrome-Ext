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
            const opts = request.options;
            const displayNums = opts.displayNums || false;
            const displayLabels = opts.displayLabels || false;
            toggleBorders(request.data, displayNums, displayLabels);
            break;
        }
        case 'scrollToComp': {
            (_a = document.getElementById(request.data)) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "center" });
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
function toggleBorders(newTrackingStrings, displayNums, displayLabels) {
    bordersEnabled = !bordersEnabled;
    if (newTrackingStrings) {
        trackingStrings = newTrackingStrings;
    }
    updateBorders(displayNums, displayLabels);
}
function getRandomColor() {
    // Generate random values for red, green, and blue components
    const randomRed = Math.floor(Math.random() * 256);
    const randomGreen = Math.floor(Math.random() * 256);
    const randomBlue = Math.floor(Math.random() * 256);
    // Calculate luminance using the WCAG formula
    const luminance = 0.2126 * randomRed / 255 + 0.7152 * randomGreen / 255 + 0.0722 * randomBlue / 255;
    // Determine the contrast ratio threshold (4.5:1 for normal text)
    const contrastThreshold = 4.5;
    // Choose text color based on luminance
    const textColor = luminance > contrastThreshold ? 'black' : 'white';
    // Construct the RGB color string
    const randomColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;
    return { randomColor, textColor };
}
const dataTracker = {};
function updateBorders(displayNums, displayLabels) {
    compIds = [];
    const elements = document.querySelectorAll('*');
    let ind = 1;
    elements.forEach((element) => {
        const htmlEle = element;
        if (bordersEnabled && matchesTrackingStrings(element.id) && htmlEle.style.display != 'none') {
            // Check if the element already has borders
            const data = dataTracker[element.id] || {};
            data.borderColor = htmlEle.style.borderColor;
            data.borderWidth = htmlEle.style.borderWidth;
            let masterEle = document.createElement("div");
            let labelEle = document.createElement("div");
            let numberEle = document.createElement("span");
            numberEle.innerHTML = ind + "";
            labelEle.innerHTML = element.id;
            let parentEle = element.parentElement;
            const randCol = getRandomColor();
            if (parentEle != null) {
                parentEle.insertBefore(masterEle, element);
                masterEle.classList.add("bordered-element");
                labelEle.style.color = randCol.textColor;
                numberEle.style.opacity = '.85';
                numberEle.style.borderWidth = '1px';
                numberEle.style.borderColor = randCol.randomColor;
                numberEle.style.color = randCol.textColor;
                if (displayNums) {
                    masterEle.appendChild(numberEle);
                }
                if (displayLabels) {
                    data.headerEle = labelEle;
                    masterEle.appendChild(labelEle);
                }
                masterEle.appendChild(element);
                data.newDiv = masterEle;
            }
            masterEle.style.borderColor = randCol.randomColor + "";
            masterEle.style.backgroundColor = randCol.randomColor + "";
            compIds.push({ id: element.id, color: randCol });
            dataTracker[htmlEle.id] = data;
            ind++;
        }
        else {
            // Remove borders from the element
            const htmlEle = element;
            const oldColor = dataTracker[htmlEle.id] != null ? dataTracker[htmlEle.id].borderColor : null;
            if (oldColor)
                htmlEle.style.borderColor = oldColor;
            else
                htmlEle.style.borderColor = '';
            const dt = dataTracker[htmlEle.id] != null ? dataTracker[htmlEle.id] : null;
            if (dt != null) {
                const addedDiv = dt.newDiv;
                if (addedDiv && addedDiv.parentElement) {
                    if (dt.headerEle != null) {
                        addedDiv.removeChild(dt.headerEle);
                    }
                    addedDiv.parentElement.replaceChild(element, addedDiv);
                    delete dataTracker[element.id];
                }
            }
        }
    });
    sendMessage({ action: "transferMatchingIds", data: compIds, options: { displayLabels: displayLabels, displayNums: displayNums } });
}
function sendMessage(message) {
    chrome.runtime.sendMessage(message);
}
function matchesTrackingStrings(id) {
    return trackingStrings.some(trackingString => id.includes(trackingString.trim()));
}
