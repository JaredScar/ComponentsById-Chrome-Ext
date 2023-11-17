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
const dataTracker: {[elementId: string]: {
        borderColor: string,
        borderWidth: string,
        newDiv: HTMLDivElement | null,
        headerEle: HTMLDivElement | null
    }
} = {};
function updateBorders() {
    compIds = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((element) => {
        const htmlEle = element as HTMLElement;
        if (bordersEnabled && matchesTrackingStrings(element.id) && htmlEle.style.display != 'none') {
            // Check if the element already has borders
            const data = dataTracker[element.id] || {};
            data.borderColor = htmlEle.style.borderColor;
            data.borderWidth = htmlEle.style.borderWidth;
            let ele = document.createElement("div");
            let divEle = document.createElement("div");
            divEle.innerHTML = element.id;
            let parentEle = element.parentElement;
            if (parentEle != null) {
                parentEle.insertBefore(ele, element);
                ele.classList.add("bordered-element");
                data.headerEle = divEle;
                divEle.style.backgroundColor = "white";
                divEle.style.color = "black";
                ele.appendChild(divEle);
                ele.appendChild(element);
                data.newDiv = ele;
            } else {
                if (!element.classList.contains('bordered-element')) {
                    // Add borders to the element
                    element.classList.add('bordered-element');
                }
            }
            const randCol = getRandomColor();
            ele.style.borderColor = randCol + "";
            ele.style.backgroundColor = randCol + "";
            compIds.push({id: element.id, color: randCol});
            dataTracker[htmlEle.id] = data;
        } else {
            // Remove borders from the element
            const htmlEle = element as HTMLElement;
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
