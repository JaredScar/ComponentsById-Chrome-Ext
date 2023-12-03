"use strict";
/// <reference path="./chrome.d.ts" />
chrome.webNavigation.onCompleted.addListener(function (details) {
    // We want to reset...
    chrome.storage.sync.set({ "isBordersOn": false });
    chrome.storage.sync.set({ 'compsList': [] });
});
