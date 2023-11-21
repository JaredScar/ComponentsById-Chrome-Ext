"use strict";
/// <reference path="./chrome.d.ts" />
let isBordersOn = false;
function sendMsg(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            isBordersOn = !isBordersOn;
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    const trackingInput = document.getElementById('trackingInput');
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
                chrome.storage.sync.set({ "isBordersOn": isBordersOn });
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBorders', data: trackingStrings });
            }
        });
        chrome.storage.sync.set({ 'trackingStrings': trackingStrings });
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'transferMatchingIds') {
            // We are getting the matching strings back, so we can update the popup...
            const opts = request.options;
            const displayNums = opts.displayNums || false;
            const displayLabels = opts.displayLabels || false;
            if (compsList) {
                compsList.innerHTML = ''; // Clear out the compsList
                let ind = 1;
                for (let dat of request.data) {
                    let str = dat.id;
                    let col = dat.color;
                    let ele = document.createElement("div");
                    let spanEle = undefined;
                    if (displayLabels) {
                        spanEle = document.createElement("span");
                        spanEle.textContent = str;
                        ele.classList.add("popup-link");
                    }
                    if (displayNums) {
                        let spanEleCircle = document.createElement("span");
                        spanEleCircle.style.borderWidth = '1px';
                        spanEleCircle.style.borderColor = col;
                        spanEleCircle.style.color = 'black';
                        spanEleCircle.textContent = ind + "";
                        ele.append(spanEleCircle);
                    }
                    if (displayLabels && spanEle)
                        ele.append(spanEle);
                    ele.addEventListener('click', function () {
                        sendMsg({ action: "scrollToComp", data: str });
                        sendMsg({ action: "bolderComp", data: str });
                    });
                    compsList.append(ele);
                    ind++;
                }
                chrome.storage.sync.set({ 'compsList': compsList.innerHTML });
            }
        }
    });
});
