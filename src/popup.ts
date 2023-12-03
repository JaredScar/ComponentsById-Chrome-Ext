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
        chrome.storage.sync.get('compsList', (subData) => {
            if (compsList && isBordersOn) {
                const btn: HTMLButtonElement = document.getElementById('dropdownMenuButton') as HTMLButtonElement;
                const toggleBtn: HTMLButtonElement = document.getElementById('toggleButton') as HTMLButtonElement;
                const compListContainer: HTMLDivElement = document.getElementById('componentListContainer') as HTMLDivElement;
                btn.disabled = true;
                toggleBtn.classList.remove('btn-success');
                toggleBtn.classList.add("btn-danger");
                compListContainer.style.display = 'block';
                compsList.innerHTML = subData.compsList || '';
            }
        });
    });
    chrome.storage.sync.get('trackingStrings', (data) => {
        const storedTrackingStrings = data.trackingStrings || [];
        trackingInput.value = storedTrackingStrings.join(',');
    });

    toggleButton.addEventListener('click', () => {
        const trackingStrings = trackingInput.value.split(',').map(str => str.trim());
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                isBordersOn = !isBordersOn;
                const btn: HTMLButtonElement = document.getElementById('dropdownMenuButton') as HTMLButtonElement;
                const toggleBtn: HTMLButtonElement = document.getElementById('toggleButton') as HTMLButtonElement;
                const compListContainer: HTMLDivElement = document.getElementById('componentListContainer') as HTMLDivElement;
                if (isBordersOn) {
                    // They have the borders on, we want to disable options...
                    btn.disabled = true;
                    toggleBtn.classList.remove('btn-success');
                    toggleBtn.classList.add("btn-danger");
                    compListContainer.style.display = 'block';
                } else {
                    // Reenable options...
                    btn.disabled = false;
                    toggleBtn.classList.remove('btn-danger');
                    toggleBtn.classList.add("btn-success");
                    compListContainer.style.display = 'none';
                }
                chrome.storage.sync.set({"isBordersOn": isBordersOn});
                const displayNums: HTMLInputElement = <HTMLInputElement> document.getElementById('numDisplay'); // Get value from checkbox in dropdown
                const displayLabels: HTMLInputElement = <HTMLInputElement> document.getElementById('labelDisplay'); // Get value from checkbox in dropdown
                chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBorders', data: trackingStrings, options: {displayNums: displayNums.checked, displayLabels: displayLabels.checked} });
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
                        spanEle.classList.add("component-list-id");
                        spanEle.textContent = str;
                        ele.classList.add("popup-link");
                        let spanEleCircle = document.createElement("span");
                        spanEleCircle.classList.add("component-list-num");
                        spanEleCircle.style.display = 'inline-block';
                        spanEleCircle.style.borderRadius = '25%';
                        spanEleCircle.style.textAlign = 'center';
                        spanEleCircle.style.verticalAlign = 'middle';
                        spanEleCircle.style.backgroundColor = col.randomColor;
                        spanEleCircle.style.color = col.textColor;
                        spanEleCircle.style.marginRight = '4px';
                        if (displayNums) {
                            spanEleCircle.textContent = ind + "";
                        } else {
                            spanEleCircle.textContent = "C";
                            spanEleCircle.style.borderRadius = '50%';
                            spanEleCircle.style.width = '30px';
                            spanEleCircle.style.height = '30px';
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
