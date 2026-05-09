import { Voter } from '../types';

/**
 * SERVICE INSTRUCTIONS:
 * After deploying your Google Apps Script, replace the URL below with your deployment URL.
 * Make sure the GAS is deployed as a Web App with access 'Anyone'.
 */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbycuERztWhKuIZFjnoPLpeq0izCdp9w7e9Agv3X_3AVbAAHgnFo0K_lQ2UwwFbK-k7HPg/exec';

export async function searchByEpic(sheetName: string, epicNumber: string): Promise<Voter | null> {
  // Check if URL is configured
  if (!GAS_URL || GAS_URL.includes('YOUR_GAS_DEPLOY_URL_HERE')) {
    throw new Error('Please configure the Google Apps Script URL in src/services/gasService.ts');
  }

  const url = `${GAS_URL}?action=searchByEpic&sheetName=${encodeURIComponent(sheetName)}&epicNumber=${encodeURIComponent(epicNumber)}`;
  const response = await fetch(url);
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data || null;
}

export async function searchVoters(sheetName: string, query: string, searchBy: 'name' | 'part' | 'serial'): Promise<Voter[]> {
  if (!GAS_URL || GAS_URL.includes('YOUR_GAS_DEPLOY_URL_HERE')) {
      throw new Error('Please configure the Google Apps Script URL in src/services/gasService.ts');
  }

  const url = `${GAS_URL}?action=search&sheetName=${encodeURIComponent(sheetName)}&query=${encodeURIComponent(query)}&searchBy=${searchBy}`;
  const response = await fetch(url);
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data || [];
}

export async function updateVoter(
  sheetName: string, 
  epicNumber: string, 
  adharNumber: string, 
  mobileNumber: string
): Promise<string> {
  if (!GAS_URL || GAS_URL.includes('YOUR_GAS_DEPLOY_URL_HERE')) {
      throw new Error('Please configure the Google Apps Script URL in src/services/gasService.ts');
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    mode: 'no-cors', // GAS often requires no-cors for POST unless handled by a redirect
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'update',
      sheetName,
      epicNumber,
      adharNumber,
      mobileNumber
    })
  });

  // Note: with mode 'no-cors', we can't read the response. 
  // If user wants to see the response, they'd need a more complex setup or a proxy.
  // For most GAS Web Apps, we just assume it worked if no exception is thrown by fetch.
  // We'll return a success message blindly but inform the user.
  return "Update request sent successfully. Check your sheet to verify.";
}
