// update this file to reflect new changes

import { DataManager } from './DataManager.js';

export const UIManager = {
    async init(mappings) {
        this.openMappingsPage(mappings);
    },

    openMappingsPage(mappings) {
        const newWindow = window.open("", "ClassMappings", "width=800,height=600");
        if (!newWindow) {
            console.error("Failed to open new window for mappings.");
            return;
        }

        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Class Mappings</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f4f4f4;
                    }
                    button {
                        padding: 5px 10px;
                        margin: 5px;
                    }
                </style>
            </head>
            <body>
                <h3>Class Mappings</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>D2L ID</th>
                            <th>Section</th>
                            <th>Canvas ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(mappings).map(([className, { d2lClassId, section = '', canvasClassId }]) => {
                            const d2lLink = d2lClassId ? `<a href="https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=${d2lClassId}" target="_blank">${d2lClassId}</a>` : '';
                            const canvasLink = canvasClassId ? `<a href="https://awsacademy.instructure.com/courses/${canvasClassId}/users" target="_blank">${canvasClassId}</a>` : '';

                            return `
                                <tr>
                                    <td>${className}</td>
                                    <td>${d2lLink}</td>
                                    <td>${section}</td>
                                    <td>${canvasLink}</td>
                                    <td>
                                        <button class="edit-btn" data-class="${className}">Edit</button>
                                        <button class="delete-btn" data-class="${className}">Delete</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                <button id="add-mapping-btn">Add New Mapping</button>
            </body>
            </html>
        `);

        newWindow.document.close();

        newWindow.document.querySelectorAll('.edit-btn').forEach((button) => {
            button.addEventListener('click', () => this.editMapping(button.dataset.class, mappings));
        });

        newWindow.document.querySelectorAll('.delete-btn').forEach((button) => {
            button.addEventListener('click', async () => {
                await DataManager.deleteMapping(button.dataset.class);
                const updatedMappings = await DataManager.getMappings();
                this.openMappingsPage(updatedMappings);
            });
        });

        newWindow.document.getElementById('add-mapping-btn').addEventListener('click', () => {
            this.addMapping(mappings);
        });
    },

    addMapping(mappings) {
        const newWindow = window.open("", "AddMapping", "width=400,height=300");
        if (!newWindow) {
            console.error("Failed to open new window for adding mappings.");
            return;
        }

        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Add Mapping</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    label {
                        display: block;
                        margin-bottom: 10px;
                    }
                    input {
                        margin-bottom: 10px;
                        padding: 5px;
                        width: calc(100% - 12px);
                    }
                    button {
                        padding: 5px 10px;
                    }
                </style>
            </head>
            <body>
                <h3>Add New Mapping</h3>
                <label>Class Name: <input id="form-class-name" type="text"></label>
                <label>D2L Class ID: <input id="form-d2l-id" type="text"></label>
                <label>Section: <input id="form-section" type="text"></label>
                <label>Canvas Class ID: <input id="form-canvas-id" type="text"></label>
                <button id="form-save-btn">Save</button>
                <button id="form-cancel-btn">Cancel</button>
            </body>
            </html>
        `);

        newWindow.document.close();

        newWindow.document.getElementById('form-save-btn').addEventListener('click', async () => {
            const newClassName = newWindow.document.getElementById('form-class-name').value.trim();
            const d2lClassId = newWindow.document.getElementById('form-d2l-id').value.trim();
            const section = newWindow.document.getElementById('form-section').value.trim();
            const canvasClassId = newWindow.document.getElementById('form-canvas-id').value.trim();

            if (!newClassName || !d2lClassId || !canvasClassId) {
                alert('Class Name, D2L ID, and Canvas ID are required.');
                return;
            }

            mappings[newClassName] = { d2lClassId, section, canvasClassId };
            await DataManager.saveMappings(mappings);
            this.openMappingsPage(mappings);
            newWindow.close();
        });

        newWindow.document.getElementById('form-cancel-btn').addEventListener('click', () => {
            newWindow.close();
        });
    },

    editMapping(className, mappings) {
        const classData = mappings[className];
        this.addMappingForm(`Edit Mapping: ${className}`, classData, async (newClassName, d2lClassId, section, canvasClassId) => {
            if (newClassName !== className) delete mappings[className];
            mappings[newClassName] = { d2lClassId, section, canvasClassId };
            await DataManager.saveMappings(mappings);
            this.openMappingsPage(mappings);
        });
    }
};
