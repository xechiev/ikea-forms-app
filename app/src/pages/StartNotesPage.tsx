import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import { fillStartNotesPdf, createPdfBlobUrl, downloadPdf, generatePdfFilename } from '../utils/pdf';
import Header from '../components/common/Header';
import SignatureCanvas from '../components/forms/SignatureCanvas';
import InchSelector from '../components/forms/InchSelector';
import type { StartNotesData, ApplianceData, CabinetPlacementData } from '../types';

const defaultPreInstallation = {
  workingFromCorrectPlans: false,
  inventoryCompleted: false,
  locationClear: false,
  customerOnSite: false,
  flooringPresent: false,
  scratchesInFloor: false,
  petsClear: false,
  servicePanelClear: false,
  restroomClear: false,
  debrisClear: false,
  knobsHandlesClear: false,
  appliancesOnSite: false,
  picturesTaken: false,
  jobSitePickedUp: false,
};

const emptyAppliance: ApplianceData = {
  isNew: null,
  width: '',
  depth: '',
  height: '',
};

const defaultAppliances = {
  dishwasher: { ...emptyAppliance },
  refrigerator: { ...emptyAppliance },
  range: { ...emptyAppliance },
  builtInOven: { ...emptyAppliance },
  microwave: { ...emptyAppliance },
  ventHood: { ...emptyAppliance },
  cooktop: { ...emptyAppliance },
};

const defaultCabinetPlacement: CabinetPlacementData = {
  floorToCeiling: '',
  floorToTopOfWallCabinet: '',
  floorToBottomOfWallCabinet: '',
  floorToCountertop: '',
  toeKickHeight: '',
  ceilingToTopOfCabinet: '',
  wallCabinetHeight: '',
  gapBetweenCabinets: '',
  baseCabinetHeight: '',
  wallToFrontOfWallCabinet: '',
  wallToFrontOfCountertop: '',
  wallToFrontOfBaseCabinet: '',
  countertopOverhang: '',
};

export function StartNotesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, updateFormData, updateFormProgress } = useJobStore();
  const { profile } = useInstallerStore();

  // Current step (1, 2, or 3)
  const [step, setStep] = useState(1);

  // Page 1 data
  const [preInstallation, setPreInstallation] = useState(defaultPreInstallation);
  const [appliances, setAppliances] = useState(defaultAppliances);
  const [jobSiteConditions, setJobSiteConditions] = useState('');
  const [customerSigPage1, setCustomerSigPage1] = useState<string | null>(null);
  const [installerSigPage1, setInstallerSigPage1] = useState<string | null>(null);

  // Page 2 data
  const [ceilingLargest, setCeilingLargest] = useState('');
  const [ceilingSmallest, setCeilingSmallest] = useState('');
  const [toeKickLargest, setToeKickLargest] = useState('');
  const [toeKickSmallest, setToeKickSmallest] = useState('');
  const [ceilingTreatment, setCeilingTreatment] = useState<string>('no_trim');
  const [underCabinetTrim, setUnderCabinetTrim] = useState<string>('no_deco');

  // Page 3 data
  const [countertopThickness, setCountertopThickness] = useState('');
  const [cabinetPlacement, setCabinetPlacement] = useState<CabinetPlacementData>(defaultCabinetPlacement);
  const [cabinetNotes, setCabinetNotes] = useState('');
  const [customerSigPage3, setCustomerSigPage3] = useState<string | null>(null);
  const [installerSigPage3, setInstallerSigPage3] = useState<string | null>(null);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentJob?.forms?.startNotes) {
      const data = currentJob.forms.startNotes;
      setPreInstallation(data.preInstallation);
      setAppliances(data.appliances);
      setJobSiteConditions(data.jobSiteConditions || '');
      setCeilingLargest(data.ceilingGaps?.largest || '');
      setCeilingSmallest(data.ceilingGaps?.smallest || '');
      setToeKickLargest(data.toeKickGaps?.largest || '');
      setToeKickSmallest(data.toeKickGaps?.smallest || '');
      setCeilingTreatment(data.ceilingTreatment || 'no_trim');
      setUnderCabinetTrim(data.underCabinetTrim || 'no_deco');
      setCountertopThickness(data.countertopThickness || '');
      setCabinetPlacement(data.cabinetPlacement || defaultCabinetPlacement);
      setCabinetNotes(data.cabinetNotes || '');
      setCustomerSigPage1(data.signatures?.customerPage1 || null);
      setInstallerSigPage1(data.signatures?.installerPage1 || null);
      setCustomerSigPage3(data.signatures?.customerPage3 || null);
      setInstallerSigPage3(data.signatures?.installerPage3 || null);
    }
  }, [currentJob]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfPreviewUrl]);

  if (!currentJob || !profile) {
    navigate('/');
    return null;
  }

  const getFormData = (): StartNotesData => ({
    preInstallation,
    appliances,
    jobSiteConditions,
    ceilingGaps: { largest: ceilingLargest, smallest: ceilingSmallest },
    toeKickGaps: { largest: toeKickLargest, smallest: toeKickSmallest },
    ceilingTreatment: ceilingTreatment as StartNotesData['ceilingTreatment'],
    underCabinetTrim: underCabinetTrim as StartNotesData['underCabinetTrim'],
    countertopThickness,
    cabinetPlacement,
    cabinetNotes,
    signatures: {
      customerPage1: customerSigPage1 || undefined,
      installerPage1: installerSigPage1 || undefined,
      customerPage3: customerSigPage3 || undefined,
      installerPage3: installerSigPage3 || undefined,
    },
  });

  const toggleCheck = (key: keyof typeof preInstallation) => {
    setPreInstallation(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateAppliance = (name: keyof typeof appliances, field: keyof ApplianceData, value: string | boolean | null) => {
    setAppliances(prev => ({
      ...prev,
      [name]: { ...prev[name], [field]: value },
    }));
  };

  const updateCabinetPlacement = (field: keyof CabinetPlacementData, value: string) => {
    setCabinetPlacement(prev => ({ ...prev, [field]: value }));
  };

  const hasAllSignatures = customerSigPage1 && installerSigPage1 && customerSigPage3 && installerSigPage3;

  const saveForm = async () => {
    setIsSaving(true);
    const formData = getFormData();
    updateFormData('startNotes', formData);
    const status = hasAllSignatures ? 'completed' : 'in_progress';
    updateFormProgress('startNotes', status);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const viewDocument = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillStartNotesPdf(currentJob, profile, getFormData(), { flatten: false });
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(createPdfBlobUrl(pdfBytes));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
    setIsGeneratingPdf(false);
  };

  const exportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillStartNotesPdf(currentJob, profile, getFormData(), { flatten: true });
      downloadPdf(pdfBytes, generatePdfFilename('Start_Notes', currentJob.customer.name));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    }
    setIsGeneratingPdf(false);
  };

  const closePreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  if (pdfPreviewUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <button onClick={closePreview} className="text-white">← {t('actions.back')}</button>
          <span className="font-semibold">{t('forms.documentPreview')}</span>
          <button onClick={exportPdf} disabled={isGeneratingPdf} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
            📥 {t('actions.download')}
          </button>
        </div>
        <iframe src={pdfPreviewUrl} className="flex-1 w-full" style={{ minHeight: 'calc(100vh - 64px)' }} title="PDF Preview" />
      </div>
    );
  }

  const checklistItems = [
    { key: 'workingFromCorrectPlans', label: t('startNotes.checks.workingFromCorrectPlans') },
    { key: 'inventoryCompleted', label: t('startNotes.checks.inventoryCompleted') },
    { key: 'locationClear', label: t('startNotes.checks.locationClear') },
    { key: 'customerOnSite', label: t('startNotes.checks.customerOnSite') },
    { key: 'flooringPresent', label: t('startNotes.checks.flooringPresent') },
    { key: 'scratchesInFloor', label: t('startNotes.checks.scratchesInFloor') },
    { key: 'petsClear', label: t('startNotes.checks.petsClear') },
    { key: 'servicePanelClear', label: t('startNotes.checks.servicePanelClear') },
    { key: 'restroomClear', label: t('startNotes.checks.restroomClear') },
    { key: 'debrisClear', label: t('startNotes.checks.debrisClear') },
    { key: 'knobsHandlesClear', label: t('startNotes.checks.knobsHandlesClear') },
    { key: 'appliancesOnSite', label: t('startNotes.checks.appliancesOnSite') },
    { key: 'picturesTaken', label: t('startNotes.checks.picturesTaken') },
    { key: 'jobSitePickedUp', label: t('startNotes.checks.jobSitePickedUp') },
  ];

  const applianceList = [
    { key: 'dishwasher', label: t('startNotes.appliances.dishwasher') },
    { key: 'refrigerator', label: t('startNotes.appliances.refrigerator') },
    { key: 'range', label: t('startNotes.appliances.range') },
    { key: 'builtInOven', label: t('startNotes.appliances.builtInOven') },
    { key: 'microwave', label: t('startNotes.appliances.microwave') },
    { key: 'ventHood', label: t('startNotes.appliances.ventHood') },
    { key: 'cooktop', label: t('startNotes.appliances.cooktop') },
  ];

  const ceilingOptions = [
    { value: 'no_trim', label: t('startNotes.ceilingOptions.no_trim') },
    { value: 'deco_standard', label: t('startNotes.ceilingOptions.deco_standard') },
    { value: 'deco_raised', label: t('startNotes.ceilingOptions.deco_raised') },
    { value: 'panel_wrap', label: t('startNotes.ceilingOptions.panel_wrap') },
    { value: 'scribe', label: t('startNotes.ceilingOptions.scribe') },
    { value: 'deco_double', label: t('startNotes.ceilingOptions.deco_double') },
  ];

  const trimOptions = [
    { value: 'no_deco', label: t('startNotes.trimOptions.no_deco') },
    { value: 'deco_vertical', label: t('startNotes.trimOptions.deco_vertical') },
    { value: 'deco_horizontal', label: t('startNotes.trimOptions.deco_horizontal') },
    { value: 'panel_under', label: t('startNotes.trimOptions.panel_under') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={`${t('startNotes.title')} - Page ${step}/3`} showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-ikea-blue' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* View Document */}
        <button onClick={viewDocument} disabled={isGeneratingPdf}
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-center gap-2 text-ikea-blue font-medium hover:bg-blue-50 disabled:text-gray-400">
          {isGeneratingPdf ? t('forms.generatingPdf') : `📄 ${t('forms.viewFullDocument')}`}
        </button>

        {/* Step 1: Pre-installation checklist & Appliances */}
        {step === 1 && (
          <>
            {/* Header Info */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">{t('job.customer')}:</span>
                  <p className="font-medium">{currentJob.customer.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">{t('job.installer')}:</span>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">{t('job.address')}:</span>
                  <p className="font-medium">{currentJob.address}</p>
                </div>
              </div>
            </div>

            {/* Pre-installation checklist */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('startNotes.preInstallation')}</h3>
              {checklistItems.map(({ key, label }) => (
                <label key={key} className="flex items-center py-2 border-b border-gray-100 last:border-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preInstallation[key as keyof typeof preInstallation]}
                    onChange={() => toggleCheck(key as keyof typeof preInstallation)}
                    className="w-5 h-5 rounded border-gray-300 mr-3"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            {/* Appliances */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-2">{t('startNotes.applianceFitGuide')}</h3>
              <p className="text-xs text-gray-500 mb-4">{t('startNotes.applianceNote')}</p>
              
              {applianceList.map(({ key, label }) => (
                <div key={key} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{label}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAppliance(key as keyof typeof appliances, 'isNew', true)}
                        className={`px-3 py-1 rounded text-xs ${
                          appliances[key as keyof typeof appliances].isNew === true
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t('startNotes.new')}
                      </button>
                      <button
                        onClick={() => updateAppliance(key as keyof typeof appliances, 'isNew', false)}
                        className={`px-3 py-1 rounded text-xs ${
                          appliances[key as keyof typeof appliances].isNew === false
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t('startNotes.existing')}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('startNotes.width')}</label>
                      <InchSelector
                        value={appliances[key as keyof typeof appliances].width}
                        onChange={(val) => updateAppliance(key as keyof typeof appliances, 'width', val)}
                        label={`${label} - ${t('startNotes.width')}`}
                        maxInches={48}
                        showQuickPresets={true}
                        quickPresets={[18, 24, 30, 36, 42, 48]}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('startNotes.depth')}</label>
                      <InchSelector
                        value={appliances[key as keyof typeof appliances].depth}
                        onChange={(val) => updateAppliance(key as keyof typeof appliances, 'depth', val)}
                        label={`${label} - ${t('startNotes.depth')}`}
                        maxInches={36}
                        showQuickPresets={true}
                        quickPresets={[12, 18, 24, 27, 30]}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">{t('startNotes.height')}</label>
                      <InchSelector
                        value={appliances[key as keyof typeof appliances].height}
                        onChange={(val) => updateAppliance(key as keyof typeof appliances, 'height', val)}
                        label={`${label} - ${t('startNotes.height')}`}
                        maxInches={48}
                        showQuickPresets={true}
                        quickPresets={[18, 24, 30, 34, 36, 42]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Job Site Conditions */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-3">{t('startNotes.jobSiteConditions')}</h3>
              <textarea
                value={jobSiteConditions}
                onChange={(e) => setJobSiteConditions(e.target.value)}
                placeholder={t('startNotes.jobSiteConditionsPlaceholder')}
                className="input-field min-h-[100px] resize-none"
              />
            </div>

            {/* Page 1 Signatures */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('forms.signatures')} (Page 1)</h3>
              <div className="space-y-4">
                <SignatureCanvas label={t('forms.customerSignature')} value={customerSigPage1} onChange={setCustomerSigPage1} />
                <SignatureCanvas label={t('forms.installerSignature')} value={installerSigPage1} onChange={setInstallerSigPage1} />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Ceiling and Toe Kick */}
        {step === 2 && (
          <>
            {/* Ceiling/Toe Kick Gaps */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('startNotes.ceilingToeKick')}</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('startNotes.ceiling')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{t('startNotes.largestGap')}</label>
                    <InchSelector
                      value={ceilingLargest}
                      onChange={setCeilingLargest}
                      label={`${t('startNotes.ceiling')} - ${t('startNotes.largestGap')}`}
                      maxInches={12}
                      quickPresets={[1, 2, 3, 4, 6, 8]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{t('startNotes.smallestGap')}</label>
                    <InchSelector
                      value={ceilingSmallest}
                      onChange={setCeilingSmallest}
                      label={`${t('startNotes.ceiling')} - ${t('startNotes.smallestGap')}`}
                      maxInches={12}
                      quickPresets={[0, 1, 2, 3]}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('startNotes.toeKick')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{t('startNotes.largestGap')}</label>
                    <InchSelector
                      value={toeKickLargest}
                      onChange={setToeKickLargest}
                      label={`${t('startNotes.toeKick')} - ${t('startNotes.largestGap')}`}
                      maxInches={8}
                      quickPresets={[3, 4, 5, 6]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">{t('startNotes.smallestGap')}</label>
                    <InchSelector
                      value={toeKickSmallest}
                      onChange={setToeKickSmallest}
                      label={`${t('startNotes.toeKick')} - ${t('startNotes.smallestGap')}`}
                      maxInches={8}
                      quickPresets={[2, 3, 4]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Ceiling Treatment */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('startNotes.ceilingTreatment')}</h3>
              <div className="space-y-2">
                {ceilingOptions.map(({ value, label }) => (
                  <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="ceilingTreatment"
                      value={value}
                      checked={ceilingTreatment === value}
                      onChange={(e) => setCeilingTreatment(e.target.value)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Under Cabinet Trim */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('startNotes.underCabinetTrim')}</h3>
              <div className="space-y-2">
                {trimOptions.map(({ value, label }) => (
                  <label key={value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="underCabinetTrim"
                      value={value}
                      checked={underCabinetTrim === value}
                      onChange={(e) => setUnderCabinetTrim(e.target.value)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">{t('startNotes.additionalCharges')}</p>
            </div>
          </>
        )}

        {/* Step 3: Cabinet Placement & Final Signatures */}
        {step === 3 && (
          <>
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('startNotes.cabinetPlacement')}</h3>
              
              {/* Countertop Thickness */}
              <div className="mb-4">
                <label className="form-label">{t('startNotes.countertopThickness')}</label>
                <InchSelector
                  value={countertopThickness}
                  onChange={setCountertopThickness}
                  label={t('startNotes.countertopThickness')}
                  minInches={0}
                  maxInches={3}
                  showQuickPresets={false}
                />
              </div>

              {/* Front View - Heights */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">📐 Front View - Heights</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Floor to Ceiling</label>
                    <InchSelector
                      value={cabinetPlacement.floorToCeiling}
                      onChange={(val) => updateCabinetPlacement('floorToCeiling', val)}
                      label="Floor to Ceiling"
                      maxInches={120}
                      quickPresets={[84, 90, 96, 102, 108, 120]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Ceiling to Top of Cabinet</label>
                    <InchSelector
                      value={cabinetPlacement.ceilingToTopOfCabinet}
                      onChange={(val) => updateCabinetPlacement('ceilingToTopOfCabinet', val)}
                      label="Ceiling to Top of Cabinet"
                      maxInches={24}
                      quickPresets={[0, 1, 2, 3, 6, 12]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Floor to Top of Wall Cab</label>
                    <InchSelector
                      value={cabinetPlacement.floorToTopOfWallCabinet}
                      onChange={(val) => updateCabinetPlacement('floorToTopOfWallCabinet', val)}
                      label="Floor to Top of Wall Cabinet"
                      maxInches={108}
                      quickPresets={[80, 84, 90, 96]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Wall Cabinet Height</label>
                    <InchSelector
                      value={cabinetPlacement.wallCabinetHeight}
                      onChange={(val) => updateCabinetPlacement('wallCabinetHeight', val)}
                      label="Wall Cabinet Height"
                      maxInches={48}
                      quickPresets={[15, 18, 24, 30, 36, 40]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Floor to Bottom of Wall Cab</label>
                    <InchSelector
                      value={cabinetPlacement.floorToBottomOfWallCabinet}
                      onChange={(val) => updateCabinetPlacement('floorToBottomOfWallCabinet', val)}
                      label="Floor to Bottom of Wall Cabinet"
                      maxInches={72}
                      quickPresets={[48, 54, 56, 60]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Gap Between Cabinets</label>
                    <InchSelector
                      value={cabinetPlacement.gapBetweenCabinets}
                      onChange={(val) => updateCabinetPlacement('gapBetweenCabinets', val)}
                      label="Gap Between Cabinets"
                      maxInches={36}
                      quickPresets={[15, 18, 20, 24]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Floor to Countertop</label>
                    <InchSelector
                      value={cabinetPlacement.floorToCountertop}
                      onChange={(val) => updateCabinetPlacement('floorToCountertop', val)}
                      label="Floor to Countertop"
                      maxInches={48}
                      quickPresets={[34, 36, 38, 42]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Base Cabinet Height</label>
                    <InchSelector
                      value={cabinetPlacement.baseCabinetHeight}
                      onChange={(val) => updateCabinetPlacement('baseCabinetHeight', val)}
                      label="Base Cabinet Height"
                      maxInches={42}
                      quickPresets={[30, 34, 36]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Toe Kick Height</label>
                    <InchSelector
                      value={cabinetPlacement.toeKickHeight}
                      onChange={(val) => updateCabinetPlacement('toeKickHeight', val)}
                      label="Toe Kick Height"
                      maxInches={8}
                      quickPresets={[3, 4, 5, 6]}
                    />
                  </div>
                </div>
              </div>

              {/* Side View - Depths */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">📐 Side View - Depths</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Wall to Front of Wall Cab</label>
                    <InchSelector
                      value={cabinetPlacement.wallToFrontOfWallCabinet}
                      onChange={(val) => updateCabinetPlacement('wallToFrontOfWallCabinet', val)}
                      label="Wall to Front of Wall Cabinet"
                      maxInches={24}
                      quickPresets={[12, 13, 15, 18]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Wall to Front of Countertop</label>
                    <InchSelector
                      value={cabinetPlacement.wallToFrontOfCountertop}
                      onChange={(val) => updateCabinetPlacement('wallToFrontOfCountertop', val)}
                      label="Wall to Front of Countertop"
                      maxInches={36}
                      quickPresets={[24, 25, 26, 27]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Wall to Front of Base Cab</label>
                    <InchSelector
                      value={cabinetPlacement.wallToFrontOfBaseCabinet}
                      onChange={(val) => updateCabinetPlacement('wallToFrontOfBaseCabinet', val)}
                      label="Wall to Front of Base Cabinet"
                      maxInches={30}
                      quickPresets={[24, 25, 27]}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Countertop Overhang</label>
                    <InchSelector
                      value={cabinetPlacement.countertopOverhang}
                      onChange={(val) => updateCabinetPlacement('countertopOverhang', val)}
                      label="Countertop Overhang"
                      maxInches={6}
                      quickPresets={[1, 2]}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">{t('startNotes.cabinetNotes')}</label>
                <textarea
                  value={cabinetNotes}
                  onChange={(e) => setCabinetNotes(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Additional cabinet placement notes..."
                />
              </div>
            </div>

            {/* Page 3 Signatures */}
            <div className="form-section">
              <h3 className="font-semibold text-gray-800 mb-4">{t('forms.signatures')} (Final)</h3>
              <div className="space-y-4">
                <SignatureCanvas label={t('forms.customerSignature')} value={customerSigPage3} onChange={setCustomerSigPage3} />
                <SignatureCanvas label={t('forms.installerSignature')} value={installerSigPage3} onChange={setInstallerSigPage3} />
              </div>
            </div>
          </>
        )}

        {/* Navigation & Actions */}
        <div className="space-y-3 mt-6">
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1">
                ← {t('actions.previous')}
              </button>
            )}
            {step < 3 && (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex-1">
                {t('actions.next')} →
              </button>
            )}
          </div>
          
          <button onClick={saveForm} disabled={isSaving} className="btn-primary w-full">
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>
          
          {step === 3 && (
            <button onClick={exportPdf} disabled={isGeneratingPdf}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
              {isGeneratingPdf ? t('forms.generatingPdf') : `📥 ${t('actions.exportPdf')}`}
            </button>
          )}
        </div>

        {saveSuccess && <p className="text-green-600 text-center mt-3">✓ {t('forms.saved')}</p>}
      </div>
    </div>
  );
}

export default StartNotesPage;
