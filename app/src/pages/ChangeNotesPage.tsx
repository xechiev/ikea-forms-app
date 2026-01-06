import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import { fillChangeNotesPdf, createPdfBlobUrl, downloadPdf, generatePdfFilename } from '../utils/pdf';
import Header from '../components/common/Header';
import SignatureCanvas from '../components/forms/SignatureCanvas';
import type { WorkItem, ChangeNotesData } from '../types';

export function ChangeNotesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, updateFormData, updateFormProgress } = useJobStore();
  const { profile } = useInstallerStore();

  // Form state
  const [workItems, setWorkItems] = useState<WorkItem[]>([
    { description: '', price: '', quantity: '1' }
  ]);
  const [customerSig, setCustomerSig] = useState<string | null>(null);
  const [installerSig, setInstallerSig] = useState<string | null>(null);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Load existing data
  useEffect(() => {
    if (currentJob?.forms?.changeNotes) {
      const data = currentJob.forms.changeNotes;
      setWorkItems(data.workItems.length > 0 ? data.workItems : [{ description: '', price: '', quantity: '1' }]);
      setCustomerSig(data.customerSignature);
      setInstallerSig(data.installerSignature);
    }
  }, [currentJob]);

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  if (!currentJob || !profile) {
    navigate('/');
    return null;
  }

  const calculateItemTotal = (item: WorkItem): number => {
    const price = parseFloat(item.price) || 0;
    const qty = parseFloat(item.quantity) || 1;
    return price * qty;
  };

  const calculateGrandTotal = (): number => {
    return workItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const hasContent = workItems.some(item => item.description.trim());
  const isComplete = hasContent && customerSig && installerSig;

  const updateWorkItem = (index: number, field: keyof WorkItem, value: string) => {
    const updated = [...workItems];
    updated[index] = { ...updated[index], [field]: value };
    setWorkItems(updated);
  };

  const addWorkItem = () => {
    if (workItems.length < 12) {
      setWorkItems([...workItems, { description: '', price: '', quantity: '1' }]);
    }
  };

  const removeWorkItem = (index: number) => {
    if (workItems.length > 1) {
      setWorkItems(workItems.filter((_, i) => i !== index));
    }
  };

  const getFormData = (): ChangeNotesData => ({
    workItems,
    totalAmount: calculateGrandTotal(),
    customerDate: new Date().toLocaleDateString(),
    installerDate: new Date().toLocaleDateString(),
    customerSignature: customerSig,
    installerSignature: installerSig,
  });

  const saveForm = async () => {
    setIsSaving(true);
    
    const formData = getFormData();
    updateFormData('changeNotes', formData);
    
    // Update progress
    const status = isComplete ? 'completed' : (hasContent || customerSig || installerSig) ? 'in_progress' : 'not_started';
    updateFormProgress('changeNotes', status);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const viewDocument = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const formData = getFormData();
      const pdfBytes = await fillChangeNotesPdf(currentJob, profile, formData, { flatten: false });
      
      // Cleanup old URL
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
      
      const url = createPdfBlobUrl(pdfBytes);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
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

  const exportPdf = async () => {
    setIsGeneratingPdf(true);
    
    try {
      const formData = getFormData();
      const pdfBytes = await fillChangeNotesPdf(currentJob, profile, formData, { flatten: true });
      const filename = generatePdfFilename('Change_Notes', currentJob.customer.name);
      downloadPdf(pdfBytes, filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(t('errors.pdfGenerationFailed'));
    }
    
    setIsGeneratingPdf(false);
  };

  // PDF Preview Modal
  if (pdfPreviewUrl) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <button
            onClick={closePreview}
            className="flex items-center gap-2 text-white"
          >
            ← {t('actions.back')}
          </button>
          <span className="font-semibold">{t('forms.documentPreview')}</span>
          <button
            onClick={exportPdf}
            disabled={isGeneratingPdf}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            📥 {t('actions.download')}
          </button>
        </div>
        <iframe
          src={pdfPreviewUrl}
          className="flex-1 w-full"
          style={{ minHeight: 'calc(100vh - 64px)' }}
          title="PDF Preview"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={t('forms.changeNotes.title')} showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* View Document Button */}
        <button
          onClick={viewDocument}
          disabled={isGeneratingPdf}
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-center gap-2 text-ikea-blue font-medium hover:bg-blue-50 transition-colors disabled:text-gray-400"
        >
          {isGeneratingPdf ? (
            <span>{t('forms.generatingPdf')}</span>
          ) : (
            <>
              <span>📄</span>
              <span>{t('forms.viewFullDocument')}</span>
            </>
          )}
        </button>

        {/* Auto-filled Header Info */}
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

        {/* Work Items */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('forms.changeNotes.workDescription')}
          </h3>

          {workItems.map((item, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateWorkItem(index, 'description', e.target.value)}
                    placeholder={t('forms.changeNotes.descriptionPlaceholder')}
                    className="input-field mb-2"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500">{t('forms.changeNotes.price')}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.price}
                          onChange={(e) => updateWorkItem(index, 'price', e.target.value)}
                          placeholder="0"
                          className="input-field pl-7"
                        />
                      </div>
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-gray-500">{t('forms.changeNotes.qty')}</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={item.quantity}
                        onChange={(e) => updateWorkItem(index, 'quantity', e.target.value)}
                        className="input-field text-center"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-500">{t('forms.changeNotes.total')}</label>
                      <div className="input-field bg-gray-50 text-center font-medium">
                        ${calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                {workItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWorkItem(index)}
                    className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}

          {workItems.length < 12 && (
            <button
              type="button"
              onClick={addWorkItem}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ikea-blue hover:text-ikea-blue transition-colors"
            >
              + {t('forms.changeNotes.addRow')}
            </button>
          )}

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">{t('forms.changeNotes.totalAmount')}:</span>
            <span className="text-2xl font-bold text-green-700">
              ${calculateGrandTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">
            {t('forms.signatures')}
          </h3>

          <div className="space-y-4">
            <SignatureCanvas
              label={t('forms.customerSignature')}
              value={customerSig}
              onChange={setCustomerSig}
            />
            <SignatureCanvas
              label={t('forms.installerSignature')}
              value={installerSig}
              onChange={setInstallerSig}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <button
            onClick={saveForm}
            disabled={isSaving}
            className="btn-primary w-full"
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>

          <button
            onClick={exportPdf}
            disabled={isGeneratingPdf}
            className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isGeneratingPdf ? t('forms.generatingPdf') : `📥 ${t('actions.exportPdf')}`}
          </button>
        </div>

        {saveSuccess && (
          <p className="text-green-600 text-center mt-3">✓ {t('forms.saved')}</p>
        )}
      </div>
    </div>
  );
}

export default ChangeNotesPage;
