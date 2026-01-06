import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import { fillCompletionReportPdf, createPdfBlobUrl, downloadPdf, generatePdfFilename } from '../utils/pdf';
import Header from '../components/common/Header';
import SignatureCanvas from '../components/forms/SignatureCanvas';
import type { CompletionReportData, MissingItem } from '../types';

const defaultChecklist = {
  applianceSpacing: { customer: false, installer: false },
  cabinetsLevel: { customer: false, installer: false },
  noDamageAppliances: { customer: false, installer: false },
  noDamageFloors: { customer: false, installer: false },
  doorsDrawersAdjusted: { customer: false, installer: false },
  handlesInstalled: { customer: false, installer: false },
  fillerStripsInstalled: { customer: false, installer: false },
  photosTaken: { customer: false, installer: false },
  distanceCookingSurface: { customer: false, installer: false },
};

const emptyMissingItem: MissingItem = {
  description: '',
  articleNumber: '',
  color: '',
  numberDamaged: 0,
  numberMissing: 0,
  numberToOrder: 0,
  numberOnsite: 0,
};

export function CompletionReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, updateFormData, updateFormProgress } = useJobStore();
  const { profile } = useInstallerStore();

  const [satisfaction, setSatisfaction] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [checklist, setChecklist] = useState<typeof defaultChecklist>(defaultChecklist);
  const [additionalWorkNotes, setAdditionalWorkNotes] = useState('');
  const [missingItems, setMissingItems] = useState<MissingItem[]>([{ ...emptyMissingItem }]);
  const [customerSig, setCustomerSig] = useState<string | null>(null);
  const [installerSig, setInstallerSig] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentJob?.forms?.completionReport) {
      const data = currentJob.forms.completionReport;
      setSatisfaction(data.satisfaction);
      setChecklist(data.checklist);
      setAdditionalWorkNotes(data.additionalWorkNotes || '');
      setMissingItems(data.missingItems.length > 0 ? data.missingItems : [{ ...emptyMissingItem }]);
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

  const getFormData = (): CompletionReportData => ({
    satisfaction,
    checklist,
    additionalWorkNotes,
    missingItems: missingItems.filter(item => item.description.trim()),
    signatures: {
      customer: customerSig || undefined,
      installer: installerSig || undefined,
    },
  });

  const updateChecklistItem = (key: keyof typeof checklist, role: 'customer' | 'installer', value: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [key]: { ...prev[key], [role]: value },
    }));
  };

  const updateMissingItem = (index: number, field: keyof MissingItem, value: string | number) => {
    const updated = [...missingItems];
    updated[index] = { ...updated[index], [field]: value };
    setMissingItems(updated);
  };

  const addMissingItem = () => {
    if (missingItems.length < 6) {
      setMissingItems([...missingItems, { ...emptyMissingItem }]);
    }
  };

  const hasSignatures = customerSig && installerSig;
  const isComplete = hasSignatures;

  const saveForm = async () => {
    setIsSaving(true);
    const formData = getFormData();
    updateFormData('completionReport', formData);
    const status = isComplete ? 'completed' : 'in_progress';
    updateFormProgress('completionReport', status);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const viewDocument = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillCompletionReportPdf(currentJob, profile, getFormData(), { flatten: false });
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(createPdfBlobUrl(pdfBytes));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('errors.pdfGenerationFailed'));
    }
    setIsGeneratingPdf(false);
  };

  const exportPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillCompletionReportPdf(currentJob, profile, getFormData(), { flatten: true });
      downloadPdf(pdfBytes, generatePdfFilename('Completion_Report', currentJob.customer.name));
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(t('errors.pdfGenerationFailed'));
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
    { key: 'applianceSpacing', label: t('completionReport.checklist.applianceSpacing') },
    { key: 'cabinetsLevel', label: t('completionReport.checklist.cabinetsLevel') },
    { key: 'noDamageAppliances', label: t('completionReport.checklist.noDamageAppliances') },
    { key: 'noDamageFloors', label: t('completionReport.checklist.noDamageFloors') },
    { key: 'doorsDrawersAdjusted', label: t('completionReport.checklist.doorsDrawersAdjusted') },
    { key: 'handlesInstalled', label: t('completionReport.checklist.handlesInstalled') },
    { key: 'fillerStripsInstalled', label: t('completionReport.checklist.fillerStripsInstalled') },
    { key: 'photosTaken', label: t('completionReport.checklist.photosTaken') },
    { key: 'distanceCookingSurface', label: t('completionReport.checklist.distanceCookingSurface') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={t('completionReport.title')} showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* View Document Button */}
        <button onClick={viewDocument} disabled={isGeneratingPdf}
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-center gap-2 text-ikea-blue font-medium hover:bg-blue-50 disabled:text-gray-400">
          {isGeneratingPdf ? t('forms.generatingPdf') : `📄 ${t('forms.viewFullDocument')}`}
        </button>

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

        {/* Satisfaction */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">{t('completionReport.satisfaction')}</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setSatisfaction(level as 1 | 2 | 3 | 4 | 5)}
                className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  satisfaction === level
                    ? 'border-ikea-blue bg-blue-50 text-ikea-blue'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            {t(`completionReport.satisfactionLevels.${satisfaction}`)}
          </p>
        </div>

        {/* Checklist */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">{t('completionReport.walkthrough')}</h3>
          
          <div className="mb-3 flex justify-end gap-8 text-xs text-gray-500 pr-2">
            <span>{t('completionReport.customer')}</span>
            <span>{t('completionReport.installer')}</span>
          </div>

          {checklistItems.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm flex-1 pr-4">{label}</span>
              <div className="flex gap-8">
                <input
                  type="checkbox"
                  checked={checklist[key as keyof typeof checklist].customer}
                  onChange={(e) => updateChecklistItem(key as keyof typeof checklist, 'customer', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <input
                  type="checkbox"
                  checked={checklist[key as keyof typeof checklist].installer}
                  onChange={(e) => updateChecklistItem(key as keyof typeof checklist, 'installer', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Work Notes */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-3">{t('completionReport.additionalWork')}</h3>
          <textarea
            value={additionalWorkNotes}
            onChange={(e) => setAdditionalWorkNotes(e.target.value)}
            placeholder={t('completionReport.additionalWorkPlaceholder')}
            className="input-field min-h-[100px] resize-none"
          />
        </div>

        {/* Missing Items */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-3">
            {t('completionReport.missingItems')} <span className="font-normal text-sm text-gray-500">{t('completionReport.missingItemsNote')}</span>
          </h3>

          {missingItems.map((item, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateMissingItem(index, 'description', e.target.value)}
                placeholder={t('completionReport.articleDescription')}
                className="input-field mb-2"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={item.articleNumber}
                  onChange={(e) => updateMissingItem(index, 'articleNumber', e.target.value)}
                  placeholder={t('completionReport.articleNumber')}
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  value={item.color}
                  onChange={(e) => updateMissingItem(index, 'color', e.target.value)}
                  placeholder={t('completionReport.color')}
                  className="input-field text-sm"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-xs text-gray-500"># Dmg</label>
                  <input
                    type="number"
                    value={item.numberDamaged || ''}
                    onChange={(e) => updateMissingItem(index, 'numberDamaged', parseInt(e.target.value) || 0)}
                    className="input-field text-sm text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500"># Miss</label>
                  <input
                    type="number"
                    value={item.numberMissing || ''}
                    onChange={(e) => updateMissingItem(index, 'numberMissing', parseInt(e.target.value) || 0)}
                    className="input-field text-sm text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500"># Order</label>
                  <input
                    type="number"
                    value={item.numberToOrder || ''}
                    onChange={(e) => updateMissingItem(index, 'numberToOrder', parseInt(e.target.value) || 0)}
                    className="input-field text-sm text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500"># Site</label>
                  <input
                    type="number"
                    value={item.numberOnsite || ''}
                    onChange={(e) => updateMissingItem(index, 'numberOnsite', parseInt(e.target.value) || 0)}
                    className="input-field text-sm text-center"
                  />
                </div>
              </div>
            </div>
          ))}

          {missingItems.length < 6 && (
            <button onClick={addMissingItem}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ikea-blue hover:text-ikea-blue">
              + {t('changeNotes.addRow')}
            </button>
          )}
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

export default CompletionReportPage;
