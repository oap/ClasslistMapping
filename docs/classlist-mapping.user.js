// ==UserScript==
// @name         Classlist Mapping
// @namespace    https://oap.github.io/
// @version      1.0
// @description  Extract and save class list data from D2L and Canvas, and map them together for comparison and analysis.
// @author       Nico Cai
// @match        https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=*
// @match        *://oap.github.io/ClasslistMapping/*
// @match        https://awsacademy.instructure.com/courses/*/users
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// ==/UserScript==

(async function () {
    'use strict';

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

    const currentURL = window.location.href;

    if (currentURL.includes('learn.rrc.ca')) {
        await handleD2LClassList();
    } else if (currentURL.includes('oap.github.io/ClasslistMapping')) {
        await handleOAPClasslistMapping();
    } else if (currentURL.includes('awsacademy.instructure.com/courses')) {
        await extractAndSaveCanvasData();
    } else {
        console.log('No matching site logic found for:', currentURL);
    }

    async function handleD2LClassList() {
        window.addEventListener('load', async () => {
            const selectElement = document.querySelector('select[data-pagination-select]');
            if (selectElement) {
                const options = Array.from(selectElement.options);
                const maxOption = options.reduce((max, option) => {
                    const value = parseInt(option.value, 10);
                    if (!isNaN(value) && (!max || value > parseInt(max.value, 10))) {
                        return option;
                    }
                    return max;
                }, null);

                if (maxOption && selectElement.value !== maxOption.value) {
                    selectElement.value = maxOption.value;
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);

                    await new Promise(resolve => {
                        const observer = new MutationObserver(() => {
                            if (document.querySelector('table#z_g tbody')) {
                                observer.disconnect();
                                resolve();
                            }
                        });
                        observer.observe(document.querySelector('table#z_g'), {
                            childList: true,
                            subtree: true
                        });
                    });
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            const ou = urlParams.get('ou');
            const tbody = document.querySelector('table#z_g tbody');

            if (!tbody) {
                console.log('No table body found.');
                return;
            }

            const rows = Array.from(tbody.querySelectorAll('tr:not(:first-child)'));
            const classList = rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const nameCell = row.querySelector('th') ? row.querySelector('th').textContent.trim() : '';
                const nameParts = nameCell.split(/(\s+)/).filter(e => e.trim().length > 0);
                const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
                const lastName = nameParts.length > 0 ? nameParts[0] : '';
                return {
                    'First Name': firstName,
                    'Last Name': lastName,
                    'UserName': cells[2] ? cells[2].textContent.trim() : '',
                    'Email': cells[3] ? cells[3].textContent.trim() : '',
                    'Role': cells[4] ? cells[4].textContent.trim() : '',
                };
            });

            const title = document.querySelector('a.d2l-navigation-s-link')?.textContent.trim();
            const match = title ? title.match(/\((\d+)\)/) : null;
            const sectionId = match ? match[1] : null;

            const data = {
                url: window.location.href,
                d2l_id: ou,
                section_id: sectionId,
                classList: classList
            };

            await GM_setValue(`d2lClassList_${ou}`, data);
            console.log(`D2L Class List JSON saved for D2L ID ${ou}:`, JSON.stringify(data, null, 2));
            exportData(`d2lClassList_${ou}`);
        });
    }

    async function handleOAPClasslistMapping() {
        const table = document.querySelector('#mappings-table');

        if (!table) {
            console.log('Table not found on OAP Classlist Mapping page.');
            return;
        }

        const classMappings = [];
        const rows = table.querySelectorAll('tbody tr');

        const resolvedData = await Promise.all(
            Array.from(rows).map(async (row) => {
                const cells = row.querySelectorAll('td');

                if (cells.length < 4) return null;

                const className = cells[0]?.textContent.trim();
                const d2lId = cells[1]?.textContent.trim();
                const section = cells[2]?.textContent.trim();
                const canvasId = cells[3]?.textContent.trim();

                const d2lLink = `https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=${d2lId}`;
                const canvasLink = `https://awsacademy.instructure.com/courses/${canvasId}/users`;

                const d2lData = await GM_getValue(`d2lClassList_${d2lId}`, { classList: [] });
                const canvasData = await GM_getValue(`canvasClassList_${canvasId}`, { classList: [] });

                return {
                    row,
                    cells,
                    d2lUserCount: d2lData.classList.length,
                    canvasUserCount: canvasData.classList.length,
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

        const filteredData = resolvedData.filter(Boolean);

        filteredData.forEach(({ row, cells, d2lUserCount, canvasUserCount, classMapping }) => {
            const d2lCell = cells[1];
            const canvasCell = cells[3];

            if (d2lCell && d2lUserCount > 0) {
                d2lCell.innerHTML += ` <span>(${d2lUserCount})</span>`;
            }

            if (canvasCell && canvasUserCount > 0) {
                canvasCell.innerHTML += ` <span>(${canvasUserCount})</span>`;
            }

            const classNameCell = cells[0];
            if (classNameCell) {
                classNameCell.style.cursor = "pointer";
                classNameCell.addEventListener("click", async () => {
                    const awsClassList = await GM_getValue(`canvasClassList_${classMapping.canvasId}`, { classList: [] });
                    const d2lClassList = await GM_getValue(`d2lClassList_${classMapping.d2lId}`, { classList: [] });
                    generateTable(awsClassList, d2lClassList);
                });
            }

            classMappings.push(classMapping);
        });

        await GM_setValue('classMappings', classMappings);
        console.log('Class Mappings JSON with Links and User Counts:', JSON.stringify(classMappings, null, 2));
    }

    async function extractAndSaveCanvasData() {
        const table = await waitForElement('table.roster.ic-Table.ic-Table--hover-row.ic-Table--condensed.ic-Table--striped', document);
        if (!table) {
            console.log('Error: Table not found');
            return;
        }

        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
        });

        const nameIndex = headers.findIndex(header => header === 'Name');
        const loginIdIndex = headers.findIndex(header => header === 'Login ID');
        const roleIndex = headers.findIndex(header => header === 'Role');

        if (nameIndex === -1 || loginIdIndex === -1 || roleIndex === -1) {
            console.log('Error: Required columns not found');
            return;
        }

        const extractedData = rows.map(row => {
            let name = row[nameIndex];
            let cleaned_name = name.replace(/\n\s*\n\s*pending/g, '').trim();
            return {
                Name: cleaned_name,
                'Login ID': row[loginIdIndex],
                Role: row[roleIndex],
                joined: !name.includes('pending'),
            };
        });

        const urlParams = new URL(window.location.href);
        const canvasId = urlParams.pathname.split('/')[2];

        const data = {
            canvasId: canvasId,
            classList: extractedData,
        };

        await GM_setValue(`canvasClassList_${canvasId}`, data);
        console.log(`Canvas Class List JSON saved for Canvas ID ${canvasId}:`, JSON.stringify(data, null, 2));
        const today = new Date().toISOString().split('T')[0];
        exportData(`canvasClassList_${canvasId}_${today}`);        
    }

    const exportData = async (key) => {
        const data = await GM_getValue(key);
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // creat a date string of the current date in the format YYYY-MM-DD
            const dateString = new Date().toISOString().split('T')[0];
            link.download = `${key}_${dateString}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log(`Exported data for key "${key}" as a JSON file.`);
        } else {
            console.log(`No data found for key "${key}".`);
        }
    };

    function generateTable(awsClassList, d2lClassList) {
        const awsEmails = awsClassList.classList.map((user) => user["Login ID"].trim()).filter(Boolean);
        const d2lEmails = d2lClassList.classList.map((user) => user.Email.trim());

        const awsSet = new Set(awsEmails);
        const d2lSet = new Set(d2lEmails);

        const allEmails = Array.from(new Set([...awsSet, ...d2lSet])).sort();

        const container = document.getElementsByClassName("container")[0]
        // Remove existing table if present
        const existingTable = container.querySelector('#studentListTable');
        if (existingTable) {
            existingTable.remove();
        }

        const table = document.createElement("table");
        table.id = "studentListTable";
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.marginBottom = "20px";

        const caption = document.createElement("caption");
        caption.textContent = `D2L: ${d2lClassList.section_id} - Canvas: ${awsClassList.canvasId}`;
        caption.style.fontWeight = "bold";
        caption.style.marginBottom = "10px";
        table.appendChild(caption);

        let d2lCount = d2lEmails.length;
        let awsCount = awsEmails.length;
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
          <th style="border: 1px solid black; padding: 8px;">Order</th>
          <th style="border: 1px solid black; padding: 8px;">D2L (${d2lCount})</th>
          <th style="border: 1px solid black; padding: 8px;">Canvas  (${awsCount})</th>
        `;
        table.appendChild(headerRow);

        for (const email of allEmails) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td style="border: 1px solid black; padding: 8px;">${allEmails.indexOf(email) + 1}</td>
            <td style="border: 1px solid black; padding: 8px;">${d2lSet.has(email) ? email : ""}</td>
            <td style="border: 1px solid black; padding: 8px;">${awsSet.has(email) ? email : ""}</td>
          `;
          table.appendChild(row);
        }

        container.appendChild(table);
        document.body.appendChild(container);
    }

    // List all saved data in Tampermonkey for this script
    // async function listAllSavedData() {
    //     const keys = GM_listValues(); // Get all keys saved by this script
    //     console.log('Listing all saved keys and their data:');
    //     for (const key of keys) {
    //         const value = await GM_getValue(key); // Retrieve the value for each key
    //         console.log(`Key: ${key}`, value);
    //     }
    // }

    // // Call this function
    // listAllSavedData();
})();
