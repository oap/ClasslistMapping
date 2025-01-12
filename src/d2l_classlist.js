// ==UserScript==
// @name         D2L Class List JSON Generator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extracts class list data from D2L class list pages and outputs it as JSON.
// @author       Nico Cai
// @match        https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    // Wait for the page to load
    window.addEventListener('load', async () => {
        // Select the dropdown element for pagination (if present)
        const selectElement = document.querySelector('select[data-pagination-select]');
        if (selectElement) {
            // Handle pagination: select the last page
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

                // Wait for the table to update
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

        // Extract the URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const ou = urlParams.get('ou');

        // Get the table body element
        const tbody = document.querySelector('table#z_g tbody');
        if (!tbody) {
            console.log('No table body found.');
            return;
        }

        // Extract the class list data
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

        // Extract the section ID from the page title
        const title = document.querySelector('a.d2l-navigation-s-link')?.textContent.trim();
        const match = title ? title.match(/\((\d+)\)/) : null;
        const sectionId = match ? match[1] : null;

        // Build the final data object
        const data = {
            url: window.location.href,
            d2l_id: ou,
            section_id: sectionId,
            classList: classList
        };

        // Convert the data to JSON and output it
        const jsonData = JSON.stringify(data, null, 2);
        console.log('D2L Class List JSON:', jsonData);
    });
})();
