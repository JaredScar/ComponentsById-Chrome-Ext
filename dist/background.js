"use strict";
/// <reference path="./chrome.d.ts" />
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
    // We want to reset...
    if (details.frameId === 0) {
        chrome.storage.sync.set({ "isBordersOn": false });
        chrome.storage.sync.set({ 'compsList': [] });
    }
});
