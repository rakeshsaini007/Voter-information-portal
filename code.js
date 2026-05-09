/**
 * Google Apps Script for Voter Information Portal
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this code.
 * 4. Click 'Deploy' > 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Set 'Execute as' to 'Me'.
 * 7. Set 'Who has access' to 'Anyone'.
 * 8. Click 'Deploy' and copy the 'Web App URL'.
 * 9. Paste that URL into the GAS_URL variable in your React app (src/services/gasService.ts).
 */

function doGet(e) {
  const action = e.parameter.action;
  const sheetName = e.parameter.sheetName;
  
  if (!sheetName) return contentResponse({ error: "Sheet name is required" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return contentResponse({ error: "Sheet '" + sheetName + "' not found" });

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  if (action === 'searchByEpic') {
    const epicNumber = e.parameter.epicNumber;
    const rowIndex = findRowIndex(rows, 0, epicNumber); // Epic Number is column 0
    if (rowIndex === -1) return contentResponse({ error: "Voter not found" });
    return contentResponse({ data: rowToObject(headers, rows[rowIndex]) });
  }

  if (action === 'search') {
    const query = e.parameter.query.toLowerCase();
    const searchBy = e.parameter.searchBy; // 'name', 'part', 'serial'
    
    let colIndex;
    if (searchBy === 'name') colIndex = 4; // Elector's Name
    else if (searchBy === 'part') colIndex = 2; // Part No
    else if (searchBy === 'serial') colIndex = 3; // Serial No
    else return contentResponse({ error: "Invalid searchBy parameter" });

    const results = rows
      .filter(row => String(row[colIndex]).toLowerCase().includes(query))
      .slice(0, 50) // Limit results
      .map(row => rowToObject(headers, row));
    
    return contentResponse({ data: results });
  }

  return contentResponse({ error: "Invalid action" });
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const sheetName = params.sheetName;
  const epicNumber = params.epicNumber;

  if (action === 'update') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return contentResponse({ error: "Sheet not found" });

    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);
    const rowIndex = findRowIndex(rows, 0, epicNumber);

    if (rowIndex === -1) return contentResponse({ error: "Voter not found" });

    // Columns: Adhar Number (12), Mobile Number (13) - 0-indexed
    // Sheet row is rowIndex + 2 (1 for header, 1 for 0-indexing)
    sheet.getRange(rowIndex + 2, 13).setValue(params.adharNumber);
    sheet.getRange(rowIndex + 2, 14).setValue(params.mobileNumber);
    
    return contentResponse({ message: "Data updated successfully" });
  }

  return contentResponse({ error: "Invalid action" });
}

function findRowIndex(rows, colIndex, value) {
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][colIndex]) === String(value)) return i;
  }
  return -1;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, i) => {
    // Normalize header names to alphanumeric only (e.g. "Elector's Name" -> "ElectorsName")
    const key = header.replace(/[^a-zA-Z0-9]/g, '');
    obj[key] = row[i];
  });
  return obj;
}

function contentResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
