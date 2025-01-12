// ==UserScript==
// @name         OAP class list mapping
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Generate JSON from class mapping tables across multiple websites and include links for D2L and Canvas.
// @author       Nico Cai
// @match        *://oap.github.io/ClasslistMapping/*
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
        } else {
            console.log('No matching site logic found for:', currentURL);
        }
    });

    // Function to handle oap.github.io/ClasslistMapping
    function handleOAPClasslistMapping() {
        const table = document.querySelector('#mappings-table');

        if (!table) {
            console.log('Table not found on OAP Classlist Mapping page.');
            return;
        }

        const classMappings = [];
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');

            if (cells.length < 4) return;

            const className = cells[0]?.textContent.trim();
            const d2lId = cells[1]?.textContent.trim();
            const section = cells[2]?.textContent.trim();
            const canvasId = cells[3]?.textContent.trim();

            // Generate links for D2L and Canvas
            const d2lLink = `https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=${d2lId}`;
            const canvasLink = `https://awsacademy.instructure.com/courses/${canvasId}/users`;

            classMappings.push({
                className,
                d2lId,
                section,
                canvasId,
                d2lLink,
                canvasLink,
            });
        });

        // Save the JSON using GM_setValue
        GM_setValue('classMappings', classMappings);

        // Output the JSON to the console
        console.log('Class Mappings JSON with Links:', JSON.stringify(classMappings, null, 2));
    }
})();
