import { PDFDocument } from 'pdf-lib';
import type { 
  Job, 
  InstallerProfile, 
  ChangeNotesData,
  CompletionReportData,
  StartNotesData,
  KitchenArticlesData,
  SiteConditionData 
} from '../types';

// ============================================================================
// PDF TEMPLATES - loaded from public folder
// ============================================================================

export const PDF_TEMPLATES = {
  changeNotes: '/templates/Change_Notes.pdf',
  completionReport: '/templates/Completion_Report.pdf',
  startNotes: '/templates/Start_Notes.pdf',
  kitchenArticles: '/templates/Kitchen_Articles_Request_Form.pdf',
  wallAnchoring: '/templates/Wall_Anchoring_Completion_Form.pdf',
  siteCondition: '/templates/Site_condition_report.pdf',
} as const;

// ============================================================================
// FIELD MAPPINGS - from PDF analysis
// ============================================================================

const CHANGE_NOTES_FIELDS = {
  customerName: 'Customer name',
  installerName: 'Installer name',
  customerAddress: 'Customer_address',
  workItems: [
    { desc: 'Desc_01', price: 'Price_01', qty: 'Qty_01', total: 'TP_01' },
    { desc: 'Work_02', price: 'Price_02', qty: 'Qty_02', total: 'TP_02' },
    { desc: 'Work_03', price: 'Price_03', qty: 'Qty_03', total: 'TP_03' },
    { desc: 'Work_04', price: 'Price_04', qty: 'Qty_04', total: 'TP_04' },
    { desc: 'Work_05', price: 'Price_05', qty: 'Qty_05', total: 'TP_05' },
    { desc: 'Work_06', price: 'Price_06', qty: 'Qty_06', total: 'TP_06' },
    { desc: 'Work_07', price: 'Price_07', qty: 'Qty_07', total: 'TP_07' },
    { desc: 'Work_08', price: 'Price_08', qty: 'Qty_08', total: 'TP_08' },
    { desc: 'Work_09', price: 'Price_09', qty: 'Qty_09', total: 'TP_09' },
    { desc: 'Work_10', price: 'Price_10', qty: 'Qty_10', total: 'TP_10' },
    { desc: 'Work_11', price: 'Price_11', qty: 'Qty_11', total: 'TP_11' },
    { desc: 'Desc_12', price: 'Price_12', qty: 'Qty_12', total: 'TP_12' },
  ],
  totalAmount: 'TP_13',
  customerDate: 'Date_customer',
  installerDate: 'Date_inst',
  signatures: {
    customer: { x: 167, y: 153, width: 168, height: 22 },
    installer: { x: 167, y: 112, width: 168, height: 22 },
  }
};

const COMPLETION_REPORT_FIELDS = {
  customerName: 'Customer name',
  installerName: 'Installer name',
  customerAddress: 'Customer_address',
  satisfaction: {
    veryUnsatisfied: 'Very unsatisfied',
    unsatisfied: 'Unsatisfied',
    acceptable: 'Acceptable',
    meetsExpectations: 'Meets_expectations',
    exceededExpectations: 'Exceeded_expectations',
  },
  checklist: {
    applianceSpacing: { customer: 'Check Box 2', installer: 'Appliance_inst' },
    cabinetsLevel: { customer: 'Level_cust', installer: 'Level_inst' },
    noDamageAppliances: { customer: 'Damage_cust', installer: 'Damage_inst' },
    noDamageFloors: { customer: 'Floors_cust', installer: 'Floors_inst' },
    doorsDrawersAdjusted: { customer: 'Doors_drawer_cust', installer: 'Doors_drawers_inst' },
    handlesInstalled: { customer: 'Handles_cust', installer: 'Handles_inst' },
    fillerStripsInstalled: { customer: 'Filler_strip_cust', installer: 'Filler_strips_inst' },
    photosTaken: { customer: 'Photos_cust', installer: 'Photos_inst' },
    distanceCookingSurface: { customer: 'Distance_cust', installer: 'Distance_Inst' },
  },
  additionalWorkNotes: 'Additional_work_notes',
  missingItems: [
    { desc: 'Desc_01', artNo: 'Art_no_01', color: 'Color_01', damage: 'Damage_01', missing: 'Missing_01', order: 'Order_01', onsite: 'Onsite_01' },
    { desc: 'Desc_02', artNo: 'Art_no_02', color: 'Color_02', damage: 'Damage_02', missing: 'Missing_02', order: 'Order_02', onsite: 'Onsite_02' },
    { desc: 'Desc_03', artNo: 'Art_no_03', color: 'Color_03', damage: 'Damage_03', missing: 'Missing_03', order: 'Order_03', onsite: 'Onsite_03' },
    { desc: 'Desc_04', artNo: 'Art_no_04', color: 'Color_04', damage: 'Damage_04', missing: 'Missing_04', order: 'Order_04', onsite: 'Onsite_04' },
    { desc: 'Desc_05', artNo: 'Art_no_05', color: 'Color_05', damage: 'Damage_05', missing: 'Missing_05', order: 'Order_05', onsite: 'Onsite_05' },
    { desc: 'Desc_06', artNo: 'Art_no_06', color: 'Color_06', damage: 'Damage_06', missing: 'Missing_06', order: 'Order_06', onsite: 'Onsite_06' },
  ],
  signatures: {
    customer: { x: 164, y: 87, width: 168, height: 22 },
    installer: { x: 164, y: 54, width: 168, height: 18 },
  }
};

const START_NOTES_FIELDS = {
  customerName: 'Text Field 40',
  installerName: 'Text Field 41',
  customerAddress: 'Text Field 42',
  installerPhone: 'Text Field 43',
  checks: {
    workingFromCorrectPlans: 'Check Box 15',
    inventoryCompleted: 'Check Box 16',
    locationClear: 'Check Box 17',
    customerOnSite: 'Check Box 18',
    flooringPresent: 'Check Box 19',
    scratchesInFloor: 'Check Box 20',
    petsClear: 'Check Box 21',
    servicePanelClear: 'Check Box 22',
    restroomClear: 'Check Box 23',
    debrisClear: 'Check Box 24',
    knobsHandlesClear: 'Check Box 25',
    appliancesOnSite: 'Check Box 26',
    picturesTaken: 'Check Box 27',
    jobSitePickedUp: 'Check Box 28',
  },
  appliances: {
    dishwasher: { w: 'Text Field 44', d: 'Text Field 45', h: 'Text Field 46' },
    refrigerator: { w: 'Text Field 47', d: 'Text Field 48', h: 'Text Field 49' },
    range: { w: 'Text Field 50', d: 'Text Field 51', h: 'Text Field 52' },
    builtInOven: { w: 'Text Field 53', d: 'Text Field 54', h: 'Text Field 55' },
    microwave: { w: 'Text Field 56', d: 'Text Field 57', h: 'Text Field 58' },
    ventHood: { w: 'Text Field 59', d: 'Text Field 60', h: 'Text Field 61' },
    cooktop: { w: 'Text Field 62', d: 'Text Field 63', h: 'Text Field 64' },
  },
  jobSiteConditions: 'Text Field 39',
  ceilingLargest: 'Text Field 77',
  ceilingSmallest: 'Text Field 78',
  toeKickLargest: 'Text Field 79',
  toeKickSmallest: 'Text Field 80',
  countertopThickness: 'Text Field 81',
  cabinetNotes: 'Text Field 82',
  signatures: {
    page1: {
      customer: { x: 156, y: 99, width: 180, height: 18 },
      installer: { x: 158, y: 52, width: 180, height: 18 },
    },
    page3: {
      customer: { x: 157, y: 90, width: 180, height: 18 },
      installer: { x: 158, y: 53, width: 180, height: 18 },
    }
  }
};

const KITCHEN_ARTICLES_FIELDS = {
  date: 'Text Field 80.Page 1',
  scheduledEnd: 'Text Field 2.Page 1',
  customerName: 'Text Field 3.Page 1',
  installerName: 'Text Field 7.Page 1',
  customerPhone: 'Text Field 4.Page 1',
  installerPhone: 'Text Field 8.Page 1',
  email: 'Text Field 5.Page 1',
  orderNumber: 'Text Field 6.Page 1',
  notes: 'Text Field 9.Page 1',
  partsDamaged: [
    { desc: 'Text Field 10.Page 1', qty: 'Text Field 45.Page 1', how: 'Text Field 17.Page 1' },
    { desc: 'Text Field 11.Page 1', qty: 'Text Field 46.Page 1', how: 'Text Field 18.Page 1' },
    { desc: 'Text Field 12.Page 1', qty: 'Text Field 47.Page 1', how: 'Text Field 19.Page 1' },
    { desc: 'Text Field 13.Page 1', qty: 'Text Field 48.Page 1', how: 'Text Field 20.Page 1' },
    { desc: 'Text Field 14.Page 1', qty: 'Text Field 49.Page 1', how: 'Text Field 21.Page 1' },
    { desc: 'Text Field 15.Page 1', qty: 'Text Field 50.Page 1', how: 'Text Field 22.Page 1' },
    { desc: 'Text Field 16.Page 1', qty: 'Text Field 51.Page 1', how: 'Text Field 23.Page 1' },
  ],
  partsNeeded: [
    { desc: 'Text Field 52.Page 1', qtyNeeded: 'Text Field 66.Page 1', qtyOnsite: 'Text Field 73.Page 1' },
    { desc: 'Text Field 53.Page 1', qtyNeeded: 'Text Field 67.Page 1', qtyOnsite: 'Text Field 74.Page 1' },
    { desc: 'Text Field 54.Page 1', qtyNeeded: 'Text Field 68.Page 1', qtyOnsite: 'Text Field 75.Page 1' },
    { desc: 'Text Field 55.Page 1', qtyNeeded: 'Text Field 69.Page 1', qtyOnsite: 'Text Field 76.Page 1' },
    { desc: 'Text Field 56.Page 1', qtyNeeded: 'Text Field 70.Page 1', qtyOnsite: 'Text Field 77.Page 1' },
    { desc: 'Text Field 57.Page 1', qtyNeeded: 'Text Field 71.Page 1', qtyOnsite: 'Text Field 78.Page 1' },
    { desc: 'Text Field 58.Page 1', qtyNeeded: 'Text Field 72.Page 1', qtyOnsite: 'Text Field 79.Page 1' },
  ],
};

const SITE_CONDITION_FIELDS = {
  contact: 'Text1',
  address: 'Text2',
  contactPhone: 'Text3',
  workOrderNumber: 'Text4',
  serviceTerritory: 'Text5',
  serviceResourceId: 'Text6',
  actualStartDate: 'Text7',
  finalFloorMaterial: 'Text8',
  doesPlanFitSpace: 'Text9',
  areWallDimensionsCorrect: 'Text10',
  isCeilingHeightCorrect: 'Text11',
  obstructionsToImpactDesign: 'Text12',
  workingFromCorrectPlan: 'Text13',
  newPlanRequired: 'Text14',
  isIpqCorrect: 'Text15',
  setupFeeNeeded: 'Text16',
  existingPlumbingNeedReconfiguring: 'Text17',
  anyArticlesMissing: 'Text18',
  customerConsentsPhoto: 'Text19',
  customerSignatureDate: 'Text20',
  installerSignatureDate: 'Text21',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function loadPdfTemplate(templatePath: string): Promise<ArrayBuffer> {
  const response = await fetch(templatePath);
  if (!response.ok) {
    throw new Error(`Failed to load PDF template: ${templatePath}`);
  }
  return response.arrayBuffer();
}

export function createPdfBlobUrl(pdfBytes: Uint8Array): string {
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

export function downloadPdf(pdfBytes: Uint8Array, filename: string): void {
  const url = createPdfBlobUrl(pdfBytes);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePdfFilename(formType: string, customerName: string): string {
  const safeName = customerName.replace(/[^a-zA-Z0-9]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `${formType}_${safeName}_${date}.pdf`;
}

function setTextField(form: ReturnType<PDFDocument['getForm']>, fieldName: string, value: string): void {
  try {
    const field = form.getTextField(fieldName);
    field.setText(value);
  } catch {
    console.warn(`Field not found: ${fieldName}`);
  }
}

function setCheckbox(form: ReturnType<PDFDocument['getForm']>, fieldName: string, checked: boolean): void {
  try {
    const field = form.getCheckBox(fieldName);
    if (checked) {
      field.check();
    } else {
      field.uncheck();
    }
  } catch {
    console.warn(`Checkbox not found: ${fieldName}`);
  }
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1];
  if (!base64) {
    throw new Error('Invalid data URL format');
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function embedSignature(
  pdfDoc: PDFDocument,
  pageIndex: number,
  signatureDataUrl: string,
  position: { x: number; y: number; width: number; height: number }
): Promise<void> {
  try {
    const imageBuffer = dataUrlToArrayBuffer(signatureDataUrl);
    const sigImage = await pdfDoc.embedPng(imageBuffer);
    const page = pdfDoc.getPages()[pageIndex];
    page.drawImage(sigImage, {
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
    });
  } catch (e) {
    console.error('Error embedding signature:', e);
    throw e;
  }
}

// ============================================================================
// CHANGE NOTES PDF
// ============================================================================

export async function fillChangeNotesPdf(
  job: Job,
  profile: InstallerProfile,
  data: ChangeNotesData,
  options: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const templateBytes = await loadPdfTemplate(PDF_TEMPLATES.changeNotes);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  setTextField(form, CHANGE_NOTES_FIELDS.customerName, job.customer.name);
  setTextField(form, CHANGE_NOTES_FIELDS.installerName, profile.name);
  setTextField(form, CHANGE_NOTES_FIELDS.customerAddress, job.address);

  const hasContent = data.workItems.some(item => item.description.trim());
  
  if (!hasContent) {
    setTextField(form, CHANGE_NOTES_FIELDS.workItems[0].desc, 'N/A - No additional work required');
  } else {
    data.workItems.forEach((item, index) => {
      if (index < CHANGE_NOTES_FIELDS.workItems.length && item.description.trim()) {
        const fields = CHANGE_NOTES_FIELDS.workItems[index];
        setTextField(form, fields.desc, item.description);
        setTextField(form, fields.price, item.price ? `$${item.price}` : '');
        setTextField(form, fields.qty, item.quantity || '1');
        const total = (parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 1);
        setTextField(form, fields.total, total > 0 ? `$${total.toFixed(2)}` : '');
      }
    });
  }

  setTextField(form, CHANGE_NOTES_FIELDS.totalAmount, `$${data.totalAmount.toFixed(2)}`);

  const today = new Date().toLocaleDateString();
  setTextField(form, CHANGE_NOTES_FIELDS.customerDate, data.customerDate || today);
  setTextField(form, CHANGE_NOTES_FIELDS.installerDate, data.installerDate || today);

  if (data.customerSignature) {
    await embedSignature(pdfDoc, 0, data.customerSignature, CHANGE_NOTES_FIELDS.signatures.customer);
  }
  if (data.installerSignature) {
    await embedSignature(pdfDoc, 0, data.installerSignature, CHANGE_NOTES_FIELDS.signatures.installer);
  }

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}

// ============================================================================
// COMPLETION REPORT PDF
// ============================================================================

export async function fillCompletionReportPdf(
  job: Job,
  profile: InstallerProfile,
  data: CompletionReportData,
  options: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const templateBytes = await loadPdfTemplate(PDF_TEMPLATES.completionReport);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  setTextField(form, COMPLETION_REPORT_FIELDS.customerName, job.customer.name);
  setTextField(form, COMPLETION_REPORT_FIELDS.installerName, profile.name);
  setTextField(form, COMPLETION_REPORT_FIELDS.customerAddress, job.address);

  // Satisfaction radio
  const satisfactionMap: Record<number, string> = {
    1: COMPLETION_REPORT_FIELDS.satisfaction.veryUnsatisfied,
    2: COMPLETION_REPORT_FIELDS.satisfaction.unsatisfied,
    3: COMPLETION_REPORT_FIELDS.satisfaction.acceptable,
    4: COMPLETION_REPORT_FIELDS.satisfaction.meetsExpectations,
    5: COMPLETION_REPORT_FIELDS.satisfaction.exceededExpectations,
  };
  
  try {
    const radioName = satisfactionMap[data.satisfaction];
    if (radioName) {
      const radioGroup = form.getRadioGroup(radioName);
      radioGroup.select('/0');
    }
  } catch {
    console.warn('Could not set satisfaction radio');
  }

  // Checklist
  const checklistMap = COMPLETION_REPORT_FIELDS.checklist;
  for (const [key, fields] of Object.entries(checklistMap)) {
    const checkData = data.checklist[key as keyof typeof data.checklist];
    if (checkData) {
      setCheckbox(form, fields.customer, checkData.customer);
      setCheckbox(form, fields.installer, checkData.installer);
    }
  }

  setTextField(form, COMPLETION_REPORT_FIELDS.additionalWorkNotes, data.additionalWorkNotes || '');

  // Missing items
  if (data.missingItems.length === 0) {
    setTextField(form, COMPLETION_REPORT_FIELDS.missingItems[0].desc, 'None');
  } else {
    data.missingItems.forEach((item, index) => {
      if (index < COMPLETION_REPORT_FIELDS.missingItems.length) {
        const fields = COMPLETION_REPORT_FIELDS.missingItems[index];
        setTextField(form, fields.desc, item.description);
        setTextField(form, fields.artNo, item.articleNumber);
        setTextField(form, fields.color, item.color);
        setTextField(form, fields.damage, item.numberDamaged?.toString() || '');
        setTextField(form, fields.missing, item.numberMissing?.toString() || '');
        setTextField(form, fields.order, item.numberToOrder?.toString() || '');
        setTextField(form, fields.onsite, item.numberOnsite?.toString() || '');
      }
    });
  }

  if (data.signatures?.customer) {
    await embedSignature(pdfDoc, 0, data.signatures.customer, COMPLETION_REPORT_FIELDS.signatures.customer);
  }
  if (data.signatures?.installer) {
    await embedSignature(pdfDoc, 0, data.signatures.installer, COMPLETION_REPORT_FIELDS.signatures.installer);
  }

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}

// ============================================================================
// START NOTES PDF
// ============================================================================

export async function fillStartNotesPdf(
  job: Job,
  profile: InstallerProfile,
  data: StartNotesData,
  options: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const templateBytes = await loadPdfTemplate(PDF_TEMPLATES.startNotes);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  setTextField(form, START_NOTES_FIELDS.customerName, job.customer.name);
  setTextField(form, START_NOTES_FIELDS.installerName, profile.name);
  setTextField(form, START_NOTES_FIELDS.customerAddress, job.address);
  setTextField(form, START_NOTES_FIELDS.installerPhone, profile.phone);

  // Pre-installation checklist
  for (const [key, fieldName] of Object.entries(START_NOTES_FIELDS.checks)) {
    const checked = data.preInstallation[key as keyof typeof data.preInstallation];
    setCheckbox(form, fieldName, !!checked);
  }

  // Appliances dimensions
  const applianceData = data.appliances;
  for (const [appliance, fields] of Object.entries(START_NOTES_FIELDS.appliances)) {
    const appData = applianceData[appliance as keyof typeof applianceData];
    if (appData) {
      setTextField(form, fields.w, appData.width || '');
      setTextField(form, fields.d, appData.depth || '');
      setTextField(form, fields.h, appData.height || '');
    }
  }

  setTextField(form, START_NOTES_FIELDS.jobSiteConditions, data.jobSiteConditions || '');
  setTextField(form, START_NOTES_FIELDS.ceilingLargest, data.ceilingGaps?.largest || '');
  setTextField(form, START_NOTES_FIELDS.ceilingSmallest, data.ceilingGaps?.smallest || '');
  setTextField(form, START_NOTES_FIELDS.toeKickLargest, data.toeKickGaps?.largest || '');
  setTextField(form, START_NOTES_FIELDS.toeKickSmallest, data.toeKickGaps?.smallest || '');
  setTextField(form, START_NOTES_FIELDS.countertopThickness, data.countertopThickness || '');
  
  // Build cabinet placement notes
  let fullNotes = '';
  if (data.cabinetPlacement) {
    const cp = data.cabinetPlacement;
    const measurements: string[] = [];
    
    if (cp.floorToCeiling) measurements.push(`Floor to Ceiling: ${cp.floorToCeiling}"`);
    if (cp.floorToTopOfWallCabinet) measurements.push(`Floor to Top Wall Cab: ${cp.floorToTopOfWallCabinet}"`);
    if (cp.floorToBottomOfWallCabinet) measurements.push(`Floor to Bottom Wall Cab: ${cp.floorToBottomOfWallCabinet}"`);
    if (cp.floorToCountertop) measurements.push(`Floor to Countertop: ${cp.floorToCountertop}"`);
    if (cp.toeKickHeight) measurements.push(`Toe Kick: ${cp.toeKickHeight}"`);
    if (cp.ceilingToTopOfCabinet) measurements.push(`Ceiling Gap: ${cp.ceilingToTopOfCabinet}"`);
    if (cp.wallCabinetHeight) measurements.push(`Wall Cab Height: ${cp.wallCabinetHeight}"`);
    if (cp.gapBetweenCabinets) measurements.push(`Gap Between Cabs: ${cp.gapBetweenCabinets}"`);
    if (cp.baseCabinetHeight) measurements.push(`Base Cab Height: ${cp.baseCabinetHeight}"`);
    if (cp.wallToFrontOfWallCabinet) measurements.push(`Wall Cab Depth: ${cp.wallToFrontOfWallCabinet}"`);
    if (cp.wallToFrontOfCountertop) measurements.push(`Countertop Depth: ${cp.wallToFrontOfCountertop}"`);
    if (cp.wallToFrontOfBaseCabinet) measurements.push(`Base Cab Depth: ${cp.wallToFrontOfBaseCabinet}"`);
    if (cp.countertopOverhang) measurements.push(`CT Overhang: ${cp.countertopOverhang}"`);
    
    if (measurements.length > 0) {
      fullNotes = 'CABINET PLACEMENT:\n' + measurements.join(' | ') + '\n\n';
    }
  }
  fullNotes += data.cabinetNotes || '';
  
  setTextField(form, START_NOTES_FIELDS.cabinetNotes, fullNotes);

  // Signatures
  if (data.signatures?.customerPage1) {
    await embedSignature(pdfDoc, 0, data.signatures.customerPage1, START_NOTES_FIELDS.signatures.page1.customer);
  }
  if (data.signatures?.installerPage1) {
    await embedSignature(pdfDoc, 0, data.signatures.installerPage1, START_NOTES_FIELDS.signatures.page1.installer);
  }
  if (data.signatures?.customerPage3) {
    await embedSignature(pdfDoc, 2, data.signatures.customerPage3, START_NOTES_FIELDS.signatures.page3.customer);
  }
  if (data.signatures?.installerPage3) {
    await embedSignature(pdfDoc, 2, data.signatures.installerPage3, START_NOTES_FIELDS.signatures.page3.installer);
  }

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}

// ============================================================================
// KITCHEN ARTICLES PDF
// ============================================================================

export async function fillKitchenArticlesPdf(
  job: Job,
  profile: InstallerProfile,
  data: KitchenArticlesData,
  options: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const templateBytes = await loadPdfTemplate(PDF_TEMPLATES.kitchenArticles);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  setTextField(form, KITCHEN_ARTICLES_FIELDS.date, data.date || new Date().toLocaleDateString());
  setTextField(form, KITCHEN_ARTICLES_FIELDS.scheduledEnd, data.scheduledEnd || '');
  setTextField(form, KITCHEN_ARTICLES_FIELDS.customerName, data.customer.name || job.customer.name);
  setTextField(form, KITCHEN_ARTICLES_FIELDS.installerName, data.installer.name || profile.name);
  setTextField(form, KITCHEN_ARTICLES_FIELDS.customerPhone, data.customer.phone || job.customer.phone);
  setTextField(form, KITCHEN_ARTICLES_FIELDS.installerPhone, data.installer.phone || profile.phone);
  setTextField(form, KITCHEN_ARTICLES_FIELDS.email, data.customer.email || '');
  setTextField(form, KITCHEN_ARTICLES_FIELDS.orderNumber, data.customer.orderNumber || '');
  setTextField(form, KITCHEN_ARTICLES_FIELDS.notes, data.installer.notes || '');

  data.partsDamaged.forEach((part, index) => {
    if (index < KITCHEN_ARTICLES_FIELDS.partsDamaged.length) {
      const fields = KITCHEN_ARTICLES_FIELDS.partsDamaged[index];
      setTextField(form, fields.desc, part.articleDescription);
      setTextField(form, fields.qty, part.quantity?.toString() || '');
      setTextField(form, fields.how, part.howDamaged);
    }
  });

  data.partsNeeded.forEach((part, index) => {
    if (index < KITCHEN_ARTICLES_FIELDS.partsNeeded.length) {
      const fields = KITCHEN_ARTICLES_FIELDS.partsNeeded[index];
      setTextField(form, fields.desc, part.articleDescription);
      setTextField(form, fields.qtyNeeded, part.quantityNeeded?.toString() || '');
      setTextField(form, fields.qtyOnsite, part.quantityOnsite?.toString() || '');
    }
  });

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}

// ============================================================================
// SITE CONDITION PDF
// ============================================================================

export async function fillSiteConditionPdf(
  job: Job,
  profile: InstallerProfile,
  data: SiteConditionData,
  options: { flatten?: boolean } = {}
): Promise<Uint8Array> {
  const templateBytes = await loadPdfTemplate(PDF_TEMPLATES.siteCondition);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  setTextField(form, SITE_CONDITION_FIELDS.contact, data.contact || job.customer.name);
  setTextField(form, SITE_CONDITION_FIELDS.address, data.address || job.address);
  setTextField(form, SITE_CONDITION_FIELDS.contactPhone, data.contactPhone || job.customer.phone);
  setTextField(form, SITE_CONDITION_FIELDS.workOrderNumber, data.workOrderNumber || '');
  setTextField(form, SITE_CONDITION_FIELDS.serviceTerritory, data.serviceTerritory || job.region);
  setTextField(form, SITE_CONDITION_FIELDS.serviceResourceId, data.serviceResourceId || profile.name);
  setTextField(form, SITE_CONDITION_FIELDS.actualStartDate, data.actualStartDate || job.date);

  const pr = data.planReadiness;
  setTextField(form, SITE_CONDITION_FIELDS.doesPlanFitSpace, pr.doesPlanFitSpace ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.areWallDimensionsCorrect, pr.areWallDimensionsCorrect ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.isCeilingHeightCorrect, pr.isCeilingHeightCorrect ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.obstructionsToImpactDesign, pr.obstructionsToImpactDesign ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.workingFromCorrectPlan, pr.workingFromCorrectPlan ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.newPlanRequired, pr.newPlanRequired ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.isIpqCorrect, pr.isIpqCorrect ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.setupFeeNeeded, pr.setupFeeNeeded ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.finalFloorMaterial, pr.finalFloorMaterial || '');
  setTextField(form, SITE_CONDITION_FIELDS.existingPlumbingNeedReconfiguring, pr.existingPlumbingNeedReconfiguring ? 'Y' : 'N');

  setTextField(form, SITE_CONDITION_FIELDS.anyArticlesMissing, pr.anyArticlesMissingDamaged ? 'Y' : 'N');
  setTextField(form, SITE_CONDITION_FIELDS.customerConsentsPhoto, pr.customerConsentsToPhoto ? 'Y' : 'N');
  
  const today = new Date().toLocaleDateString();
  setTextField(form, SITE_CONDITION_FIELDS.customerSignatureDate, data.signatures?.customerDate || today);
  setTextField(form, SITE_CONDITION_FIELDS.installerSignatureDate, data.signatures?.installerDate || today);

  if (options.flatten) {
    form.flatten();
  }

  return pdfDoc.save();
}
