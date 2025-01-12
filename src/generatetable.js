// Function to generate a table based on AWS and D2L class lists
function generateTable(awsClassList, d2lClassList) {
    // Extract email lists from AWS and D2L data
    const awsEmails = awsClassList.classList.map((user) => user["Login ID"].trim()).filter(Boolean);
    const d2lEmails = d2lClassList.classList.map((user) => user.Email.trim());
  
    // Create sets for easy comparison
    const awsSet = new Set(awsEmails);
    const d2lSet = new Set(d2lEmails);
  
    // Find unique and matching emails
    const matchingEmails = [...awsSet].filter((email) => d2lSet.has(email));
    const awsOnlyEmails = [...awsSet].filter((email) => !d2lSet.has(email));
    const d2lOnlyEmails = [...d2lSet].filter((email) => !awsSet.has(email));
  
    // Create a container for the table
    const container = document.createElement("div");
    container.style.padding = "20px";
  
    // Create a table element
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "20px";
  
    // Add a caption
    const caption = document.createElement("caption");
    caption.textContent = `Class: ${d2lClassList.section_id}`;
    caption.style.fontWeight = "bold";
    caption.style.marginBottom = "10px";
    table.appendChild(caption);
  
    // Add headers
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
      <th style="border: 1px solid black; padding: 8px;">D2L (${d2lEmails.length})</th>
      <th style="border: 1px solid black; padding: 8px;">Canvas (${awsEmails.length})</th>
    `;
    table.appendChild(headerRow);
  
    // Find the maximum number of rows for this table
    const maxRows = Math.max(d2lOnlyEmails.length, awsOnlyEmails.length, matchingEmails.length);
  
    // Add rows for each email
    for (let i = 0; i < maxRows; i++) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="border: 1px solid black; padding: 8px;">${d2lOnlyEmails[i] || ""}</td>
        <td style="border: 1px solid black; padding: 8px;">${awsOnlyEmails[i] || ""}</td>
        <td style="border: 1px solid black; padding: 8px;">${matchingEmails[i] || ""}</td>
      `;
      table.appendChild(row);
    }
  
    // Add the table to the container
    container.appendChild(table);
  
    // Add the container to the document body
    document.body.appendChild(container);
  }
  
  // Example usage
  const awsClassList = {
    "canvasId": "103005",
    "classList": [
      {
        "Name": "Nico Cai",
        "Login ID": "ncai@rrc.ca.awsacademy",
        "Role": "Teacher",
        "joined": true
      },
      {
        "Name": "jlicmo2@academic.rrc.ca",
        "Login ID": "jlicmo2@academic.rrc.ca",
        "Role": "Student",
        "joined": true
      },
      {
        "Name": "jmagalhaes@academic.rrc.ca",
        "Login ID": "jmagalhaes@academic.rrc.ca",
        "Role": "Student",
        "joined": true
      }
    ]
  };
  
  const d2lClassList = {
    "url": "https://learn.rrc.ca/d2l/lms/classlist/classlist.d2l?ou=557953",
    "d2l_id": "557953",
    "section_id": "261302",
    "classList": [
      {
        "First Name": "Jake",
        "Last Name": "Licmo",
        "UserName": "jlicmo2",
        "Email": "jlicmo2@academic.rrc.ca",
        "Role": "Student"
      },
      {
        "First Name": "Joao Fernando",
        "Last Name": "Magalhaes",
        "UserName": "jmagalhaes",
        "Email": "jmagalhaes@academic.rrc.ca",
        "Role": "Student"
      },
      {
        "First Name": "Kalvin",
        "Last Name": "Berena",
        "UserName": "kberena",
        "Email": "kberena@academic.rrc.ca",
        "Role": "Student"
      }
    ]
  };
  
  generateTable(awsClassList, d2lClassList);
  