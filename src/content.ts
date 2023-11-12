/// <reference path="./chrome.d.ts" />
const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.type = 'text/css';
styleElement.href = chrome.extension.getURL('content.css');
(document.head || document.documentElement).appendChild(styleElement);
chrome.runtime.onMessage.addListener(
    (request: any, sender: any, sendResponse: any) => {
        switch (request.action) {
            case 'toggleBorders': {
                toggleBorders(request.data);
                break;
            }
            case 'scrollToComp': {
                document.getElementById(request.data)?.scrollIntoView({behavior: "smooth", block: "center"} as ScrollIntoViewOptions);
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
    }
);

let bordersEnabled = false;
let trackingStrings: string[] = [];
let compIds: any[] = [];

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
function getRandomColor() {
    // Generate random values for red, green, and blue components
    const randomRed = Math.floor(Math.random() * 256);
    const randomGreen = Math.floor(Math.random() * 256);
    const randomBlue = Math.floor(Math.random() * 256);

    // Construct the RGB color string
    const randomColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;

    return randomColor;
}
let oldBorderColors: {[str: string]: string} = {};
function updateBorders() {
    compIds = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
        const htmlEle = element as HTMLElement;
        if (bordersEnabled && matchesTrackingStrings(element.id) && htmlEle.style.display != 'none') {
            // Check if the element already has borders
            oldBorderColors[htmlEle.id] = htmlEle.style.borderColor;
            if (!element.classList.contains('bordered-element')) {
                // Add borders to the element
                element.classList.add('bordered-element');
            }
            const randCol = getRandomColor();
            htmlEle.style.borderColor = randCol + "";
            compIds.push({id: element.id, color: randCol});
        } else {
            // Remove borders from the element
            const htmlEle = element as HTMLElement;
            const oldColor = oldBorderColors[htmlEle.id];
            if (oldColor)
                htmlEle.style.borderColor = oldColor;
            else
                htmlEle.style.borderColor = '';
            element.classList.remove('bordered-element');
        }
    });
    sendMessage({action: "transferMatchingIds", data: compIds});
}

function sendMessage(message: {action: any, data: any}) {
    chrome.runtime.sendMessage(message);
}

function matchesTrackingStrings(id: string): boolean {
    return trackingStrings.some(trackingString => id.includes(trackingString.trim()));
}
