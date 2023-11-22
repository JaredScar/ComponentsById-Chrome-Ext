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
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBorders', data: trackingStrings, options: {displayNums: false, displayLabels: false} });
            }
        });

        chrome.storage.sync.set({ 'trackingStrings': trackingStrings });
    });

    chrome.runtime.onMessage.addListener(
        (request: any, sender: any, sendResponse: any) => {
            if (request.action === 'transferMatchingIds') {
                // We are getting the matching strings back, so we can update the popup...
                const opts = request.options;
                const displayNums = opts.displayNums || false;
                const displayLabels = opts.displayLabels || false;
                if (compsList) {
                    compsList.innerHTML = ''; // Clear out the compsList
                    let ind = 1;
                    for (let dat of request.data) {
                        let str: string = dat.id;
                        let col: any = dat.color;
                        let ele = document.createElement("div");
                        let spanEle = undefined;
                        spanEle = document.createElement("span");
                        spanEle.textContent = str;
                        ele.classList.add("popup-link");
                        let spanEleCircle = document.createElement("span");
                        spanEleCircle.style.display = 'inline-block';
                        spanEleCircle.style.border = '1px solid ' + col.randomColor;
                        spanEleCircle.style.borderRadius = '50%';
                        spanEleCircle.style.backgroundColor = col.randomColor;
                        spanEleCircle.style.color = col.textColor;
                        spanEleCircle.style.color = 'black';
                        spanEleCircle.style.marginRight = '4px';
                        if (displayNums) {
                            spanEleCircle.textContent = ind + "";
                        } else {
                            spanEleCircle.textContent = "C";
                        }
                        ele.append(spanEleCircle);
                        ele.append(spanEle);

                        ele.addEventListener('click', function () {
                            sendMsg({action: "scrollToComp", data: str});
                            sendMsg({action: "bolderComp", data: str});
                        });
                        compsList.append(ele);
                        ind++;
                    }
                    chrome.storage.sync.set({'compsList': compsList.innerHTML});
                }
            }
        }
    );
});
