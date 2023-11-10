// chrome.d.ts

declare namespace chrome {
    namespace runtime {
        const onMessage: {
            addListener(func: any): void;
        };
    }

    namespace tabs {
        interface Tab {
            // Define the properties of the Tab type
            id: number;
            windowId: number;
            // Add more properties as needed
        }
        function query(
            queryInfo: any,
            callback: (result: chrome.tabs.Tab[]) => void
        ): void;
        function sendMessage(
            message: any,
            responseCallback?: { trackingStrings: string[]; action: string }
        ): void;
    }

    namespace storage {
        const sync: {
            get(keys: string | string[] | null, callback: (items: { [key: string]: any }) => void): void;
            set(items: { [key: string]: any }, callback?: () => void): void;
        };
    }
}
