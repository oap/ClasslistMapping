``
const headers = Array.from($0.querySelectorAll('thead th')).map(th => th.textContent.trim());
const rows = Array.from($0.querySelectorAll('tbody tr'));
const data = rows.map(row => {
  const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
  return cells;
});
const nameIndex = headers.findIndex(header => header === 'Name');
const loginIdIndex = headers.findIndex(header => header === 'Login ID');
const extractedData = data.map(row => {
    let name = row[nameIndex];
    let joined = true;
    if (name.includes('pending')) {
        joined = false;
        name = name.split('\n')[0].trim();
    }
    return {
        Name: name,
        LoginId: row[loginIdIndex],
        Joined: joined
    };
});
const url = window.location.href;
const canvasIdMatch = url.match(/\/courses\/(\d+)\//);
const canvasId = canvasIdMatch ? canvasIdMatch[1] : null;
const now = new Date();
const dateTimeString = now.toISOString();
const result = {
    canvasId: canvasId,
    students: extractedData,
    dateTime: dateTimeString
};
const formattedJsonString = JSON.stringify(result, null, 2);
const formattedJsonResult = {
    formattedJsonString
}