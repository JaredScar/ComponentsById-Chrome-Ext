// chrome.d.ts

declare namespace chrome {
    namespace runtime {
        const onMessage: {
            addListener(func: any): void;
        };
        function sendMessage(message: any): void;
    }

    namespace webNavigation {
        const onBeforeNavigate: {
            addListener(func: any): void;
        }
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
            responseCallback?: { data: any; action: string, options?: any }
        ): void;
    }

    namespace storage {
        const sync: {
            get(keys: string | string[] | null, callback: (items: { [key: string]: any }) => void): void;
            set(items: { [key: string]: any }, callback?: () => void): void;
        };
    }

    namespace extension {
        // Add extension-related interfaces or functions here
        // For example:
        const getURL: (path: string) => string;
    }
}
