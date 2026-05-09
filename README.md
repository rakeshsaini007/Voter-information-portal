# Voter Information Portal

A comprehensive voter information management system that connects with Google Sheets to fetch, search, and update elector details including Aadhaar and Mobile numbers.

## Features

- **Sheet Selection:** Choose from multiple part-wise ranges (e.g., 1-25, 26-50).
- **EPIC Search:** Quickly fetch voter details by Epic Number.
- **Advanced Search:** Search by name or serial number.
- **Data Updates:** Update Aadhaar and Mobile numbers directly from the interface.
- **Hindi Support:** Displays names in both English and Hindi.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Setup Instructions

### 1. Google Sheets Setup
Ensure your Google Sheet follow the structure below with headers in the first row across multiple sheets named "1-25", "26-50", etc.:
- `Epic Number`
- `AC No.`
- `Part No.`
- `Serial No`
- `Elector's Name`
- `Elector Name Hindi`
- `Elector Gender`
- `Age`
- `D.O.B`
- `Relative Name`
- `Relative Name Hindi`
- `Relative type`
- `Adhar Number`
- `Mobile Number`

### 2. Google Apps Script Configuration
1. Open your Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Create a new file or use `code.gs` and paste the contents of `code.js` from this repository.
4. Click **Deploy > New Deployment**.
5. Select **Web App**.
6. Set **Execute as** to `Me`.
7. Set **Who has access** to `Anyone`.
8. Click **Deploy** and copy the **Web App URL**.

### 3. Application Configuration
1. In the source code, open `src/services/gasService.ts`.
2. Replace `YOUR_GAS_DEPLOY_URL_HERE` with the URL you copied from Step 2.

## Development

```bash
npm install
npm run dev
```

## Deployment on Vercel
This project is configured for Vercel. Simply push to your GitHub repository and link it to Vercel. A `vercel.json` file is already included to handle SPA routing.
