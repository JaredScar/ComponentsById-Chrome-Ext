/// <reference path="./chrome.d.ts" />
chrome.webNavigation.onCompleted.addListener(function(details: any) {
    // We want to reset...
    chrome.storage.sync.set({"isBordersOn": false});
    chrome.storage.sync.set({'compsList': []});
});