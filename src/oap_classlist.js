// ==UserScript==
// @name         OAP class list mapping
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Generate JSON from class mapping tables across multiple websites and include links for D2L and Canvas, with user count display.
// @author       Your Name
// @match        *://oap.github.io/ClasslistMapping/*
// @match        https://awsacademy.instructure.com/courses/*/users
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    // Wait for the page to load
    window.addEventListener('load', () => {
        const currentURL = window.location.href;

        // Identify the website and execute its corresponding logic
        if (currentURL.includes('oap.github.io/ClasslistMapping')) {
            handleOAPClasslistMapping();
        } else if (currentURL.includes('awsacademy.instructure.com/courses')) {
            extractAndSaveCanvasData();
        } else {
            console.log('No matching site logic found for:', currentURL);
        }
    });

    // Function to handle oap.github.io/ClasslistMapping
    async function handleOAPClasslistMapping() {
        const table = document.querySelector('#mappings-table');

        if (!table) {
            console.log('Table not found on OAP Classlist Mapping page.');
            return;
        }

        const classMappings = [];
        const rows = table.querySelectorAll('tbody tr');

        // Fetch all data first before modifying the DOM
        const resolvedData = await Promise.all(
            Array.from(rows).map(async (row) => {
                const cells = row.querySelectorAll('td');

                if (cells.length < 4) return null;

                const className = cells[0]?.textContent.trim();
                const d2lId = cells[1]?.textContent.trim();
                const section = cells[2]?.textContent.trim();
                const canvasId = cells[3]?.textContent.trim();

                // Generate links for D2L and Canvas
                const d2lLink = `https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=${d2lId}`;
                const canvasLink = `https://awsacademy.instructure.com/courses/${canvasId}/users`;

                // Retrieve user counts from stored data
                const d2lData = await GM_getValue(`d2lClassList_${d2lId}`, []);
                const canvasData = await GM_getValue(`canvasClassList_${canvasId}`, []);

                return {
                    row,
                    cells,
                    d2lUserCount: d2lData.length,
                    canvasUserCount: canvasData.length,
                    classMapping: {
                        className,
                        d2lId,
                        section,
                        canvasId,
                        d2lLink,
                        canvasLink,
                    },
                };
            })
        );

        // Filter out null entries
        const filteredData = resolvedData.filter(Boolean);

        // Modify the DOM after all data is fetched
        filteredData.forEach(({ row, cells, d2lUserCount, canvasUserCount, classMapping }) => {
            const d2lCell = cells[1];
            const canvasCell = cells[3];

            if (d2lCell && d2lUserCount > 0) {
                d2lCell.innerHTML += ` <span>(${d2lUserCount})</span>`;
            }

            if (canvasCell && canvasUserCount > 0) {
                canvasCell.innerHTML += ` <span>(${canvasUserCount})</span>`;
            }

            classMappings.push(classMapping);
        });

        // Save the JSON using GM_setValue
        await GM_setValue('classMappings', classMappings);

        // Output the JSON to the console
        console.log('Class Mappings JSON with Links and User Counts:', JSON.stringify(classMappings, null, 2));

        // Update Canvas user counts for all rows
        await updateAllCanvasUserCounts();

        // Update D2L user counts for all rows
        await updateAllD2LUserCounts();
    }

    // Function to update Canvas user counts for all rows
    async function updateAllCanvasUserCounts() {
        const table = document.querySelector('#mappings-table');
        const rows = table.querySelectorAll('tbody tr');

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            const canvasId = cells[3]?.textContent.trim();

            if (canvasId) {
                const canvasData = await GM_getValue(`canvasClassList_${canvasId}`, { classList: [] });
                const canvasUserCount = canvasData.classList.filter(user => user["Login ID"]?.trim()).length;

                const canvasCell = cells[3];
                if (canvasCell && canvasUserCount > 0) {
                    canvasCell.innerHTML += ` <span>(${canvasUserCount})</span>`;
                }
            }
        }
    }

    // Function to update D2L user counts for all rows
    async function updateAllD2LUserCounts() {
        const table = document.querySelector('#mappings-table');
        const rows = table.querySelectorAll('tbody tr');

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            const d2lId = cells[1]?.textContent.trim();

            if (d2lId) {
                const d2lData = await GM_getValue(`d2lClassList_${d2lId}`, { classList: [] });
                const d2lUserCount = d2lData.classList.filter(user => user.Email?.trim()).length;

                const d2lCell = cells[1];
                if (d2lCell && d2lUserCount > 0) {
                    d2lCell.innerHTML += ` <span>(${d2lUserCount})</span>`;
                }
            }
        }
    }

    // Function to extract and save Canvas class list data
    async function extractAndSaveCanvasData() {
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
            let cleaned_name = name.replace(/\n\s*\n\s*pending/g, '').trim(); // Clean up "pending" text
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
        exportData(`canvasClassList_${canvasId}`);
    }

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
})();
