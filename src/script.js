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
        row.innerHTML = `
            <td>${mapping.className}</td>
            <td>${mapping.d2lId}</td>
            <td>${mapping.section}</td>
            <td>${mapping.canvasId}</td>
            <td>
                <button onclick="showForm(${index})">Edit</button>
                <button onclick="deleteMapping(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to show the form for adding or editing
function showForm(index = null) {
    const formContainer = document.createElement('div');
    formContainer.id = 'form-container';
    formContainer.style.position = 'fixed';
    formContainer.style.top = '50%';
    formContainer.style.left = '50%';
    formContainer.style.transform = 'translate(-50%, -50%)';
    formContainer.style.padding = '20px';
    formContainer.style.backgroundColor = 'white';
    formContainer.style.border = '1px solid #ccc';
    formContainer.style.zIndex = '1000';

    const mappings = getMappings();
    const mapping = index !== null ? mappings[index] : { className: '', d2lId: '', section: '', canvasId: '' };

    formContainer.innerHTML = `
        <form id="mapping-form">
            <label>Class Name: <input type="text" id="className" value="${mapping.className}" required></label><br><br>
            <label>D2L ID: <input type="text" id="d2lId" value="${mapping.d2lId}" required></label><br><br>
            <label>Section: <input type="text" id="section" value="${mapping.section}" required></label><br><br>
            <label>Canvas ID: <input type="text" id="canvasId" value="${mapping.canvasId}" required></label><br><br>
            <button type="submit">Save</button>
            <button type="button" onclick="closeForm()">Cancel</button>
        </form>
    `;

    document.body.appendChild(formContainer);

    const form = document.getElementById('mapping-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedMapping = {
            className: document.getElementById('className').value,
            d2lId: document.getElementById('d2lId').value,
            section: document.getElementById('section').value,
            canvasId: document.getElementById('canvasId').value
        };

        if (index !== null) {
            mappings[index] = updatedMapping;
        } else {
            mappings.push(updatedMapping);
        }

        saveMappings(mappings);
        populateTable();
        closeForm();
    });
}

// Function to close the form
function closeForm() {
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
        document.body.removeChild(formContainer);
    }
}

// Function to delete a mapping
function deleteMapping(index) {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    const mappings = getMappings();
    mappings.splice(index, 1);
    saveMappings(mappings);
    populateTable();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    populateTable();
    document.getElementById('add-mapping-btn').addEventListener('click', () => showForm());
});
