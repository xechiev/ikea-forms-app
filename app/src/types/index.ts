// Job Types
export type JobType = 'installation' | 'wo' | 'prefit';

export interface ParsedJob {
  status: string;
  jobType: JobType;
  region: string;
  customer: {
    name: string;
    phone: string;
  };
  address: string;
  date: string;
  time: string;
  notes: string;
}

export interface InstallerProfile {
  name: string;
  phone: string;
  company: string;
}

// Form Status
export type FormStatus = 'not_started' | 'in_progress' | 'completed';

export interface FormProgress {
  startNotes: FormStatus;
  changeNotes: FormStatus;
  kitchenArticles: FormStatus;
  completionReport: FormStatus;
  wallAnchoring: FormStatus;
  siteCondition: FormStatus;
}

// Job with forms
export interface Job extends ParsedJob {
  id: string;
  createdAt: string;
  formProgress: FormProgress;
  forms: {
    startNotes?: StartNotesData;
    changeNotes?: ChangeNotesData;
    kitchenArticles?: KitchenArticlesData;
    completionReport?: CompletionReportData;
    wallAnchoring?: WallAnchoringData;
    siteCondition?: SiteConditionData;
  };
}

// Start Notes Form Data
export interface StartNotesData {
  // Page 1 - Pre-installation checkboxes
  preInstallation: {
    workingFromCorrectPlans: boolean;
    inventoryCompleted: boolean;
    locationClear: boolean;
    customerOnSite: boolean;
    flooringPresent: boolean;
    scratchesInFloor: boolean;
    petsClear: boolean;
    servicePanelClear: boolean;
    restroomClear: boolean;
    debrisClear: boolean;
    knobsHandlesClear: boolean;
    appliancesOnSite: boolean;
    picturesTaken: boolean;
    jobSitePickedUp: boolean;
  };
  
  // Appliance fit guide
  appliances: {
    dishwasher: ApplianceData;
    refrigerator: ApplianceData;
    range: ApplianceData;
    builtInOven: ApplianceData;
    microwave: ApplianceData;
    ventHood: ApplianceData;
    cooktop: ApplianceData;
  };
  
  // Job site conditions
  jobSiteConditions: string;
  
  // Page 2 - Ceiling and toe kick
  ceilingGaps: {
    largest: string;
    smallest: string;
  };
  toeKickGaps: {
    largest: string;
    smallest: string;
  };
  ceilingTreatment: 'no_trim' | 'deco_standard' | 'deco_raised' | 'panel_wrap' | 'scribe' | 'deco_double';
  underCabinetTrim: 'no_deco' | 'deco_vertical' | 'deco_horizontal' | 'panel_under';
  
  // Page 3 - Cabinet placement specifications
  countertopThickness: string;
  cabinetPlacement: CabinetPlacementData;
  cabinetNotes: string;
  
  // Signatures
  signatures: {
    customerPage1?: string; // base64 PNG
    installerPage1?: string;
    customerPage3?: string;
    installerPage3?: string;
  };
}

// Cabinet Placement dimensions (front view and side view)
export interface CabinetPlacementData {
  // Front view - left side
  floorToCeiling: string;           // Overall height
  floorToTopOfWallCabinet: string;  // Height to top of wall cabinet
  floorToBottomOfWallCabinet: string; // Height to bottom of wall cabinet
  floorToCountertop: string;        // Height to countertop
  toeKickHeight: string;            // Toe kick height
  
  // Front view - right side
  ceilingToTopOfCabinet: string;    // Gap from ceiling to top of cabinet
  wallCabinetHeight: string;        // Wall cabinet height
  gapBetweenCabinets: string;       // Gap between wall and base cabinet
  baseCabinetHeight: string;        // Base cabinet height (without countertop)
  
  // Side view
  wallToFrontOfWallCabinet: string; // Wall cabinet depth
  wallToFrontOfCountertop: string;  // Countertop depth from wall
  wallToFrontOfBaseCabinet: string; // Base cabinet depth
  countertopOverhang: string;       // Countertop overhang
}

export interface ApplianceData {
  isNew: boolean | null;
  width: string;
  depth: string;
  height: string;
}

// Change Notes Form Data
export interface ChangeNotesData {
  workItems: WorkItem[];
  totalAmount: number;
  customerDate: string;
  installerDate: string;
  customerSignature: string | null;
  installerSignature: string | null;
}

export interface WorkItem {
  description: string;
  price: string; // String for form input, parsed to number for calculations
  quantity: string;
}

// Kitchen Articles Request Form Data
export interface KitchenArticlesData {
  customer: {
    name: string;
    phone: string;
    email: string;
    orderNumber: string;
  };
  installer: {
    name: string;
    phone: string;
    notes: string;
  };
  date: string;
  scheduledEnd: string;
  partsDamaged: DamagedPart[];
  partsNeeded: NeededPart[];
}

export interface DamagedPart {
  articleDescription: string;
  quantity: number;
  howDamaged: string;
}

export interface NeededPart {
  articleDescription: string;
  quantityNeeded: number;
  quantityOnsite: number;
}

// Completion Report Form Data
export interface CompletionReportData {
  satisfaction: 1 | 2 | 3 | 4 | 5;
  checklist: {
    applianceSpacing: ChecklistItem;
    cabinetsLevel: ChecklistItem;
    noDamageAppliances: ChecklistItem;
    noDamageFloors: ChecklistItem;
    doorsDrawersAdjusted: ChecklistItem;
    handlesInstalled: ChecklistItem;
    fillerStripsInstalled: ChecklistItem;
    photosTaken: ChecklistItem;
    distanceCookingSurface: ChecklistItem;
  };
  additionalWorkNotes: string;
  missingItems: MissingItem[];
  signatures: {
    customer?: string;
    installer?: string;
  };
}

export interface ChecklistItem {
  customer: boolean;
  installer: boolean;
}

export interface MissingItem {
  description: string;
  articleNumber: string;
  color: string;
  numberDamaged: number;
  numberMissing: number;
  numberToOrder: number;
  numberOnsite: number;
}

// Wall Anchoring Form Data
export interface WallAnchoringData {
  date: string;
  installerName: string;
  companyName: string;
  customer: {
    name: string;
    address: string;
  };
  drywallWoodenStuds: WallAnchoringSection;
  drywallMetalStuds: WallAnchoringSection;
  solidConcrete: SolidConcreteSection;
  hollowConcrete: HollowConcreteSection;
  islandPeninsula: {
    isPresent: boolean;
    anchoringMethod: string;
  };
}

export interface WallAnchoringSection {
  screwType: string;
  railAnchored: boolean;
  toggleBoltsUsed: boolean;
  toggleBoltsDetails: string;
}

export interface SolidConcreteSection extends WallAnchoringSection {
  adhesiveUsed: boolean;
  adhesiveDetails: string;
}

export interface HollowConcreteSection extends SolidConcreteSection {
  expandedAnchorsUsed: boolean;
  expandedAnchorsDetails: string;
}

// Site Condition Report Form Data
export interface SiteConditionData {
  contact: string;
  address: string;
  contactPhone: string;
  workOrderNumber: string;
  serviceTerritory: string;
  serviceResourceId: string;
  actualStartDate: string;
  planReadiness: {
    doesPlanFitSpace: boolean;
    areWallDimensionsCorrect: boolean;
    isCeilingHeightCorrect: boolean;
    obstructionsToImpactDesign: boolean;
    workingFromCorrectPlan: boolean;
    newPlanRequired: boolean;
    isIpqCorrect: boolean;
    setupFeeNeeded: boolean;
    finalFloorMaterial: string;
    existingPlumbingNeedReconfiguring: boolean;
    anyArticlesMissingDamaged: boolean;
    customerConsentsToPhoto: boolean;
  };
  additionalNotes: string;
  signatures: {
    customer?: string;
    customerDate?: string;
    installer?: string;
    installerDate?: string;
  };
}

// App Language
export type Language = 'en' | 'ru';
