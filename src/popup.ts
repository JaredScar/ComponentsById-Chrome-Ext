/// <reference path="./chrome.d.ts" />
let isBordersOn: boolean = false;

function sendMsg(message: any) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            isBordersOn = !isBordersOn;
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton')!;
    const trackingInput = document.getElementById('trackingInput') as HTMLInputElement;
    let compsList = document.getElementById("components");

    chrome.storage.sync.get("isBordersOn", (data) => {
        isBordersOn = data.isBordersOn || false;
    });
    chrome.storage.sync.get('trackingStrings', (data) => {
        const storedTrackingStrings = data.trackingStrings || [];
        trackingInput.value = storedTrackingStrings.join(',');
    });
    chrome.storage.sync.get('compsList', (data) => {
        if (compsList && isBordersOn)
            compsList.innerHTML = data.compsList || '';
    });

    toggleButton.addEventListener('click', () => {
        const trackingStrings = trackingInput.value.split(',').map(str => str.trim());
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                isBordersOn = !isBordersOn;
                chrome.storage.sync.set({"isBordersOn": isBordersOn});
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBorders', data: trackingStrings });
            }
        });

        chrome.storage.sync.set({ 'trackingStrings': trackingStrings });
    });

    chrome.runtime.onMessage.addListener(
        (request: any, sender: any, sendResponse: any) => {
            if (request.action === 'transferMatchingIds') {
                // We are getting the matching strings back, so we can update the popup...
                if (compsList) {
                    compsList.innerHTML = ''; // Clear out the compsList
                    for (let dat of request.data) {
                        let str: string = dat.id;
                        let col: string = dat.color;
                        let ele = document.createElement("div");
                        let spanEleCircle = document.createElement("span");
                        spanEleCircle.textContent = '⬤ ';
                        spanEleCircle.style.color = col;
                        let spanEle = document.createElement("span");
                        spanEle.textContent = str;
                        ele.classList.add("popup-link");
                        ele.append(spanEleCircle, spanEle);
                        ele.addEventListener('click', function () {
                            sendMsg({action: "scrollToComp", data: str});
                            sendMsg({action: "bolderComp", data: str});
                        });
                        compsList.append(ele);
                    }
                    chrome.storage.sync.set({'compsList': compsList.innerHTML});
                }
            }
        }
    );
});
