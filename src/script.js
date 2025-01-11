// script.js

// Function to get mappings from localStorage
function getMappings() {
    const mappings = localStorage.getItem('classMappings');
    return mappings ? JSON.parse(mappings) : [];
}

// Function to save mappings to localStorage
function saveMappings(mappings) {
    localStorage.setItem('classMappings', JSON.stringify(mappings));
}

// Function to populate the table
function populateTable() {
    const mappings = getMappings();
    const tableBody = document.querySelector('#mappings-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (mappings.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">No mappings available</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    mappings.forEach((mapping, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'even-row' : 'odd-row';
        row.setAttribute('data-index', index);
        
        const isEditing = mapping.isEditing || false;
        
        if (isEditing) {
            row.classList.add('editing-row');
        }
        row.innerHTML = `
            <td>${isEditing ? 
            `<div class="edit-input" contenteditable="true">${mapping.className}</div>` : 
            `<span class="view-text">${mapping.className}</span>`}</td>
            <td>${isEditing ? 
            `<div class="edit-input" contenteditable="true">${mapping.d2lId}</div>` :
            `<a href="https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=${mapping.d2lId}" target="_blank" class="view-link">${mapping.d2lId}</a>`}</td>
            <td>${isEditing ? 
            `<div class="edit-input" contenteditable="true">${mapping.section}</div>` :
            `<span class="view-text">${mapping.section}</span>`}</td>
            <td>${isEditing ? 
            `<div class="edit-input" contenteditable="true">${mapping.canvasId}</div>` :
            `<a href="https://awsacademy.instructure.com/courses/${mapping.canvasId}/users" target="_blank" class="view-link">${mapping.canvasId}</a>`}</td>
            <td>
            ${isEditing ? 
                `<button onclick="saveRow(${index})" class="save-btn">💾 Save</button>` :
                `<button onclick="editRow(${index})" class="edit-btn">✏️ Edit</button>`}
            <button onclick="deleteMapping(${index})" class="delete-btn">🗑️ Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to update a specific field of a mapping
function updateMapping(index, field, value) {
    const mappings = getMappings();
    mappings[index][field] = value;
    saveMappings(mappings);
    populateTable();
}

// Function to add a new mapping row
function addMapping() {
    const mappings = getMappings();
    mappings.push({ className: 'New Class', d2lId: 'd2lId', section: 'New Section', canvasId: 'canvasId' });
    saveMappings(mappings);
    populateTable();
}

// Function to delete a mapping
function deleteMapping(index) {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    const mappings = getMappings();
    mappings.splice(index, 1);
    saveMappings(mappings);
    populateTable();
}

// Function to enable editing mode for a row
function editRow(index) {
    const mappings = getMappings();
    mappings[index].isEditing = true;
    saveMappings(mappings);
    populateTable();
}

// Function to save an edited row
function saveRow(index) {
    const mappings = getMappings();
    const row = document.querySelector(`tr[data-index="${index}"]`);
    const inputs = row.querySelectorAll('.edit-input');
    
    mappings[index].className = inputs[0].textContent;
    mappings[index].d2lId = inputs[1].textContent;
    mappings[index].section = inputs[2].textContent;
    mappings[index].canvasId = inputs[3].textContent;
    mappings[index].isEditing = false;
    
    saveMappings(mappings);
    populateTable();
}

// Function to sort mappings by a specific field and toggle ascending/descending order
let sortOrder = {}; // Track sort order for each field
function sortTable(field) {
    const mappings = getMappings();
    
    if (!sortOrder[field]) {
        sortOrder[field] = 'asc'; // Default to ascending if not defined
    }

    mappings.sort((a, b) => {
        const comparison = a[field].localeCompare(b[field]);
        return sortOrder[field] === 'asc' ? comparison : -comparison;
    });

    // Toggle sort order
    sortOrder[field] = sortOrder[field] === 'asc' ? 'desc' : 'asc';

    saveMappings(mappings);
    populateTable();
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeButton = document.querySelector('#dark-mode-toggle');
    body.classList.toggle('dark'); // Toggle the dark class
    const isDarkMode = body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode); // Save the state

    // Update the button icon
    darkModeButton.innerHTML = isDarkMode ? '☀️' : '🌙'; // Sun for light mode, Moon for dark mode
    darkModeButton.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'; // Tooltip for better UX
}



// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Apply dark mode if previously set
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }

    populateTable();
    document.getElementById('add-mapping-btn').addEventListener('click', addMapping);

    // Add sorting functionality to table headers
    const headers = document.querySelectorAll('#mappings-table thead th');
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            const fields = ['className', 'd2lId', 'section', 'canvasId'];
            if (fields[index]) {
                sortTable(fields[index]);
            }
        });
    });

    // Add dark mode toggle button
    const darkModeButton = document.createElement('button');
    darkModeButton.id = 'dark-mode-toggle';
    darkModeButton.innerHTML = localStorage.getItem('darkMode') === 'true' ? '☀️' : '🌙';
    darkModeButton.style.cssText = 'position: fixed; right: 20px; top: 20px; font-size: 24px; background: none; border: none; cursor: pointer; padding: 10px;';
    darkModeButton.title = localStorage.getItem('darkMode') === 'true' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    darkModeButton.addEventListener('click', toggleDarkMode);
    document.body.appendChild(darkModeButton);
});


