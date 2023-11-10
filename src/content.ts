/// <reference path="./chrome.d.ts" />

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

    elements.forEach((element: Element) => {
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
                element.parentNode?.insertBefore(borderWrapper, element);
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
        } else {
            // Remove borders from the element
            element.classList.remove('bordered-element');

            // Check if the element has a wrapper, and remove it
            const borderWrapper = element.closest('.border-wrapper');
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
