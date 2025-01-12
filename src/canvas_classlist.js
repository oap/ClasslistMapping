// ==UserScript==
// @name         Canvas Class List JSON Generator
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Extracts class list data from Canvas pages and outputs JSON.
// @author       Nico Cai
// @match        https://awsacademy.instructure.com/courses/*/users
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // Main function to extract and save table data
    const extractAndSaveTableData = async () => {
        // Wait for the table to appear in the main document
        const table = await waitForElement('table.roster.ic-Table.ic-Table--hover-row.ic-Table--condensed.ic-Table--striped', document);
        if (!table) {
            console.log('Error: Table not found');
            return;
        }

        // Extract table headers and rows
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
        });

        // Identify required column indexes
        const nameIndex = headers.findIndex(header => header === 'Name');
        const loginIdIndex = headers.findIndex(header => header === 'Login ID');
        const roleIndex = headers.findIndex(header => header === 'Role');

        if (nameIndex === -1 || loginIdIndex === -1 || roleIndex === -1) {
            console.log('Error: Required columns not found');
            return;
        }

        // Extract data from rows
        const extractedData = rows.map(row => {
            let name = row[nameIndex];
            cleaned_name = name.replace(/\n\s*\n\s*pending/g, '').trim(); // Clean up "pending" text
            return {
                Name: cleaned_name,
                'Login ID': row[loginIdIndex],
                Role: row[roleIndex],
                joined: !name.includes('pending'), // Indicate if user has joined
            };
        });

        // Extract Canvas ID from URL
        const urlParams = new URL(window.location.href);
        const canvasId = urlParams.pathname.split('/')[2]; // Extract course ID from URL

        // Build the final JSON object
        const data = {
            canvasId: canvasId,
            classList: extractedData,
        };

        // Save the JSON data using GM_setValue
        await GM_setValue(`canvasClassList_${canvasId}`, data);
        console.log(`Canvas Class List JSON saved for Canvas ID ${canvasId}:`, JSON.stringify(data, null, 2));
        // Call this function with the key of your saved data
        exportData(`canvasClassList_${canvasId}`);

    };

    const exportData = async (key) => {
        const data = await GM_getValue(key);
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${key}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log(`Exported data for key "${key}" as a JSON file.`);
        } else {
            console.log(`No data found for key "${key}".`);
        }
    };




    // Utility function to wait for an element to appear
    const waitForElement = (selector, context = document, timeout = 5000) => {
        return new Promise((resolve) => {
            const element = context.querySelector(selector);
            if (element) return resolve(element);

            const observer = new MutationObserver(() => {
                const foundElement = context.querySelector(selector);
                if (foundElement) {
                    observer.disconnect();
                    resolve(foundElement);
                }
            });

            observer.observe(context, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    };

    // Run the main function
    extractAndSaveTableData();
})();
