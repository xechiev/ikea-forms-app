import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useJobStore, useInstallerStore } from '../store';
import { fillKitchenArticlesPdf, createPdfBlobUrl, downloadPdf, generatePdfFilename } from '../utils/pdf';
import Header from '../components/common/Header';
import type { KitchenArticlesData, DamagedPart, NeededPart } from '../types';

const emptyDamagedPart: DamagedPart = {
  articleDescription: '',
  quantity: 0,
  howDamaged: '',
};

const emptyNeededPart: NeededPart = {
  articleDescription: '',
  quantityNeeded: 0,
  quantityOnsite: 0,
};

export function KitchenArticlesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentJob, updateFormData, updateFormProgress } = useJobStore();
  const { profile } = useInstallerStore();

  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [installerName, setInstallerName] = useState('');
  const [installerPhone, setInstallerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [partsDamaged, setPartsDamaged] = useState<DamagedPart[]>([{ ...emptyDamagedPart }]);
  const [partsNeeded, setPartsNeeded] = useState<NeededPart[]>([{ ...emptyNeededPart }]);

  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (currentJob && profile) {
      setCustomerName(currentJob.customer.name);
      setCustomerPhone(currentJob.customer.phone);
      setInstallerName(profile.name);
      setInstallerPhone(profile.phone);
    }
    
    if (currentJob?.forms?.kitchenArticles) {
      const data = currentJob.forms.kitchenArticles;
      setDate(data.date);
      setScheduledEnd(data.scheduledEnd);
      setCustomerName(data.customer.name);
      setCustomerPhone(data.customer.phone);
      setEmail(data.customer.email);
      setOrderNumber(data.customer.orderNumber);
      setInstallerName(data.installer.name);
      setInstallerPhone(data.installer.phone);
      setNotes(data.installer.notes);
      setPartsDamaged(data.partsDamaged.length > 0 ? data.partsDamaged : [{ ...emptyDamagedPart }]);
      setPartsNeeded(data.partsNeeded.length > 0 ? data.partsNeeded : [{ ...emptyNeededPart }]);
    }
  }, [currentJob, profile]);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfPreviewUrl]);

  if (!currentJob || !profile) {
    navigate('/');
    return null;
  }

  const getFormData = (): KitchenArticlesData => ({
    date,
    scheduledEnd,
    customer: {
      name: customerName,
      phone: customerPhone,
      email,
      orderNumber,
    },
    installer: {
      name: installerName,
      phone: installerPhone,
      notes,
    },
    partsDamaged: partsDamaged.filter(p => p.articleDescription.trim()),
    partsNeeded: partsNeeded.filter(p => p.articleDescription.trim()),
  });

  const updateDamagedPart = (index: number, field: keyof DamagedPart, value: string | number) => {
    const updated = [...partsDamaged];
    updated[index] = { ...updated[index], [field]: value };
    setPartsDamaged(updated);
  };

  const updateNeededPart = (index: number, field: keyof NeededPart, value: string | number) => {
    const updated = [...partsNeeded];
    updated[index] = { ...updated[index], [field]: value };
    setPartsNeeded(updated);
  };

  const addDamagedPart = () => {
    if (partsDamaged.length < 7) {
      setPartsDamaged([...partsDamaged, { ...emptyDamagedPart }]);
    }
  };

  const addNeededPart = () => {
    if (partsNeeded.length < 7) {
      setPartsNeeded([...partsNeeded, { ...emptyNeededPart }]);
    }
  };

  const hasContent = partsDamaged.some(p => p.articleDescription.trim()) || 
                     partsNeeded.some(p => p.articleDescription.trim());

  const saveForm = async () => {
    setIsSaving(true);
    const formData = getFormData();
    updateFormData('kitchenArticles', formData);
    const status = hasContent ? 'completed' : 'in_progress';
    updateFormProgress('kitchenArticles', status);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const viewDocument = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdfBytes = await fillKitchenArticlesPdf(currentJob, profile, getFormData(), { flatten: false });
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
      const pdfBytes = await fillKitchenArticlesPdf(currentJob, profile, getFormData(), { flatten: true });
      downloadPdf(pdfBytes, generatePdfFilename('Kitchen_Articles', currentJob.customer.name));
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

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Header title={t('forms.kitchenArticles')} showBack />

      <div className="p-4 max-w-lg mx-auto">
        {/* View Document */}
        <button onClick={viewDocument} disabled={isGeneratingPdf}
          className="w-full bg-white rounded-xl p-4 shadow-sm mb-4 flex items-center justify-center gap-2 text-ikea-blue font-medium hover:bg-blue-50 disabled:text-gray-400">
          {isGeneratingPdf ? t('forms.generatingPdf') : `📄 ${t('forms.viewFullDocument')}`}
        </button>

        {/* Header Info */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Date</label>
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Scheduled End</label>
                <input type="text" value={scheduledEnd} onChange={(e) => setScheduledEnd(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="form-label">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Order #</label>
                <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        {/* Installer Info */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Installer Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Installer Name</label>
                <input type="text" value={installerName} onChange={(e) => setInstallerName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input type="tel" value={installerPhone} onChange={(e) => setInstallerPhone(e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[80px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Parts Damaged */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Parts Damaged</h3>
          
          {partsDamaged.map((part, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
              <input
                type="text"
                value={part.articleDescription}
                onChange={(e) => updateDamagedPart(index, 'articleDescription', e.target.value)}
                placeholder="Article description"
                className="input-field mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Qty</label>
                  <input
                    type="number"
                    value={part.quantity || ''}
                    onChange={(e) => updateDamagedPart(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">How Damaged</label>
                  <input
                    type="text"
                    value={part.howDamaged}
                    onChange={(e) => updateDamagedPart(index, 'howDamaged', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {partsDamaged.length < 7 && (
            <button onClick={addDamagedPart}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ikea-blue hover:text-ikea-blue">
              + Add Row
            </button>
          )}
        </div>

        {/* Parts Needed */}
        <div className="form-section">
          <h3 className="font-semibold text-gray-800 mb-4">Parts Needed</h3>
          
          {partsNeeded.map((part, index) => (
            <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
              <input
                type="text"
                value={part.articleDescription}
                onChange={(e) => updateNeededPart(index, 'articleDescription', e.target.value)}
                placeholder="Article description"
                className="input-field mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Qty Needed</label>
                  <input
                    type="number"
                    value={part.quantityNeeded || ''}
                    onChange={(e) => updateNeededPart(index, 'quantityNeeded', parseInt(e.target.value) || 0)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Qty Onsite</label>
                  <input
                    type="number"
                    value={part.quantityOnsite || ''}
                    onChange={(e) => updateNeededPart(index, 'quantityOnsite', parseInt(e.target.value) || 0)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {partsNeeded.length < 7 && (
            <button onClick={addNeededPart}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-ikea-blue hover:text-ikea-blue">
              + Add Row
            </button>
          )}
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

export default KitchenArticlesPage;
