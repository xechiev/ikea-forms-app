import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import { fillSiteConditionPdf, createPdfBlobUrl, downloadPdf, generatePdfFilename } from '../utils/pdf';
import Header from '../components/common/Header';
import SignatureCanvas from '../components/forms/SignatureCanvas';
import type { SiteConditionData } from '../types';

const defaultPlanReadiness = {
  doesPlanFitSpace: true,
  areWallDimensionsCorrect: true,
  isCeilingHeightCorrect: true,
  obstructionsToImpactDesign: false,
  workingFromCorrectPlan: true,
  newPlanRequired: false,
  isIpqCorrect: true,
  setupFeeNeeded: false,
  finalFloorMaterial: '',
  existingPlumbingNeedReconfiguring: false,
  anyArticlesMissingDamaged: false,
  customerConsentsToPhoto: true,
};

export function SiteConditionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, updateFormData, updateFormProgress } = useJobStore();
  const { profile } = useInstallerStore();

  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [serviceTerritory, setServiceTerritory] = useState('');
  const [serviceResourceId, setServiceResourceId] = useState('');
  const [actualStartDate, setActualStartDate] = useState('');
  const [planReadiness, setPlanReadiness] = useState(defaultPlanReadiness);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [customerSig, setCustomerSig] = useState<string | null>(null);
  const [installerSig, setInstallerSig] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentJob) {
      setContact(currentJob.customer.name);
      setAddress(currentJob.address);
      setContactPhone(currentJob.customer.phone);
      setServiceTerritory(currentJob.region);
      setActualStartDate(currentJob.date);
    }
    
    if (currentJob?.forms?.siteCondition) {
      const data = currentJob.forms.siteCondition;
      setContact(data.contact);
      setAddress(data.address);
      setContactPhone(data.contactPhone);
      setWorkOrderNumber(data.workOrderNumber);
      setServiceTerritory(data.serviceTerritory);
      setServiceResourceId(data.serviceResourceId);
      setActualStartDate(data.actualStartDate);
      setPlanReadiness(data.planReadiness);
      setAdditionalNotes(data.additionalNotes);
      setCustomerSig(data.signatures?.customer || null);
      setInstallerSig(data.signatures?.installer || null);
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

  const getFormData = (): SiteConditionData => ({
    contact,
    address,
    contactPhone,
    workOrderNumber,
    serviceTerritory,
    serviceResourceId,
    actualStartDate,
    planReadiness,
    additionalNotes,
    signatures: {
      customer: customerSig || undefined,
      installer: installerSig || undefined,
      customerDate: new Date().toLocaleDateString(),
      installerDate: new Date().toLocaleDateString(),
    },
  });

  const togglePlanReadiness = (key: keyof typeof planReadiness) => {
    if (key === 'finalFloorMaterial') return;
    setPlanReadiness(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasSignatures = customerSig && installerSig;
  const isComplete = hasSignatures;

  const saveForm = async () => {
    setIsSaving(true);
    const formData = getFormData();
    updateFormData('siteCondition', formData);
    const status = isComplete ? 'completed' : 'in_progress';
    updateFormProgress('siteCondition', status);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const viewDocument = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillSiteConditionPdf(currentJob, profile, getFormData(), { flatten: false });
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
      const pdfBytes = await fillSiteConditionPdf(currentJob, profile, getFormData(), { flatten: true });
      downloadPdf(pdfBytes, generatePdfFilename('Site_Condition', currentJob.customer.name));
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

  const booleanQuestions = [
    { key: 'doesPlanFitSpace', label: 'Does the plan fit the space?' },
    { key: 'areWallDimensionsCorrect', label: 'Are wall dimensions correct?' },
    { key: 'isCeilingHeightCorrect', label: 'Is ceiling height correct?' },
    { key: 'obstructionsToImpactDesign', label: 'Obstructions that will impact design?' },
    { key: 'workingFromCorrectPlan', label: 'Working from correct plan?' },
    { key: 'newPlanRequired', label: 'New plan required?' },
    { key: 'isIpqCorrect', label: 'Is IPQ correct?' },
    { key: 'setupFeeNeeded', label: 'Setup fee needed?' },
    { key: 'existingPlumbingNeedReconfiguring', label: 'Existing plumbing need reconfiguring?' },
    { key: 'anyArticlesMissingDamaged', label: 'Any articles missing/damaged?' },
    { key: 'customerConsentsToPhoto', label: 'Customer consents to photo?' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title="Site Condition Report" showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* View Document */}
        <button onClick={viewDocument} disabled={isGeneratingPdf}
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-center gap-2 text-ikea-blue font-medium hover:bg-blue-50 disabled:text-gray-400">
          {isGeneratingPdf ? t('forms.generatingPdf') : `📄 ${t('forms.viewFullDocument')}`}
        </button>

        {/* Header Info */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="form-label">Contact Name</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="form-label">Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Work Order #</label>
                <input type="text" value={workOrderNumber} onChange={(e) => setWorkOrderNumber(e.target.value)} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Service Territory</label>
                <input type="text" value={serviceTerritory} onChange={(e) => setServiceTerritory(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input type="text" value={actualStartDate} onChange={(e) => setActualStartDate(e.target.value)} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Readiness */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Plan Readiness</h3>
          
          {booleanQuestions.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm flex-1 pr-4">{label}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePlanReadiness(key as keyof typeof planReadiness)}
                  className={`px-4 py-1 rounded-lg text-sm font-medium ${
                    planReadiness[key as keyof typeof planReadiness]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Y
                </button>
                <button
                  onClick={() => togglePlanReadiness(key as keyof typeof planReadiness)}
                  className={`px-4 py-1 rounded-lg text-sm font-medium ${
                    !planReadiness[key as keyof typeof planReadiness]
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  N
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <label className="form-label">Final Floor Material</label>
            <input
              type="text"
              value={planReadiness.finalFloorMaterial}
              onChange={(e) => setPlanReadiness(prev => ({ ...prev, finalFloorMaterial: e.target.value }))}
              className="input-field"
              placeholder="e.g., Hardwood, Tile, etc."
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-3">Additional Notes</h3>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any additional notes..."
            className="input-field min-h-[100px] resize-none"
          />
        </div>

        {/* Signatures */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">{t('forms.signatures')}</h3>
          <div className="space-y-4">
            <SignatureCanvas label={t('forms.customerSignature')} value={customerSig} onChange={setCustomerSig} />
            <SignatureCanvas label={t('forms.installerSignature')} value={installerSig} onChange={setInstallerSig} />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button onClick={saveForm} disabled={isSaving} className="btn-primary w-full">
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>
          <button onClick={exportPdf} disabled={isGeneratingPdf}
            className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
            {isGeneratingPdf ? t('forms.generatingPdf') : `📥 ${t('actions.exportPdf')}`}
          </button>
        </div>

        {saveSuccess && <p className="text-green-600 text-center mt-3">✓ {t('forms.saved')}</p>}
      </div>
    </div>
  );
}

export default SiteConditionPage;
