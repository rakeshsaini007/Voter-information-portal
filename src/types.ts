export interface Voter {
  EpicNumber: string;
  ACNo: number;
  PartNo: number;
  SerialNo: number;
  ElectorsName: string;
  ElectorNameHindi: string;
  ElectorGender: string;
  Age: number;
  DOB: string;
  RelativeName: string;
  RelativeNameHindi: string;
  Relativetype: string;
  AdharNumber: string;
  MobileNumber: string;
}

export type SheetRange = string;

export const SHEET_RANGES: SheetRange[] = [
  "1-25", "26-50", "51-75", "76-100", "101-125", 
  "126-150", "151-175", "176-200", "201-225", "226-250", 
  "251-275", "276-300", "301-325", "326-350", "351-380"
];
