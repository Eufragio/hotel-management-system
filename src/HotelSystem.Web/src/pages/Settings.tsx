import { useState, useEffect } from 'react';
import { FaSave, FaBuilding, FaGlobe, FaCog, FaImage } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { Settings } from '../services/api';

type TabType = 'company' | 'regional' | 'system';

const currencySymbols: Record<string, string> = {
    USD: '$',
    PEN: 'S/',
    EUR: '€',
    GBP: '£',
    MXN: '$',
    COP: '$',
    ARS: '$',
    CLP: '$',
};

const SettingsPage = () => {
    const { t } = useTranslation();
    const { data: settings, isLoading, isError, error, refetch } = useSettings();
    const updateMutation = useUpdateSettings();

    const [activeTab, setActiveTab] = useState<TabType>('company');
    const [formData, setFormData] = useState<Settings | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
            setLogoPreview(settings.logoBase64);
        }
    }, [settings]);

    const handleInputChange = (field: keyof Settings, value: string | number) => {
        if (!formData) return;

        const updates: Partial<Settings> = { [field]: value };

        // Auto-update currency symbol when currency changes
        if (field === 'currency' && typeof value === 'string') {
            const symbol = currencySymbols[value] || '$';
            updates.currencySymbol = symbol;
        }

        setFormData({
            ...formData,
            ...updates
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Image size must be less than 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            handleInputChange('logoBase64', base64);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoPreview(null);
        handleInputChange('logoBase64', '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Debug logging
    console.log('Settings Page State:', { isLoading, isError, hasData: !!settings, formData: !!formData, error });

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-center">
                <div className="text-red-500 text-xl mb-4">⚠️ {t('common.error') || 'Error loading settings'}</div>
                <p className="text-slate-500 mb-4">{(error as any)?.message || 'Something went wrong'}</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    {t('common.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="flex flex-col justify-center items-center h-64 text-center">
                <div className="text-amber-500 text-xl mb-4">⚠️ {t('settings.noData') || 'No settings found'}</div>
                <p className="text-slate-500 mb-4">{t('settings.noDataDesc') || 'The settings could not be loaded. Please try again.'}</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    {t('common.retry') || 'Retry'}
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'company' as TabType, label: t('settings.tabs.company') || 'Company', icon: FaBuilding },
        { id: 'regional' as TabType, label: t('settings.tabs.regional') || 'Regional', icon: FaGlobe },
        { id: 'system' as TabType, label: t('settings.tabs.system') || 'System', icon: FaCog },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">⚙️ {t('settings.title') || 'System Settings'}</h1>
                <p className="text-slate-500 mt-1">{t('settings.subtitle') || 'Configure your hotel system'}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            <tab.icon className={`mr-2 ${activeTab === tab.id ? 'text-primary-500' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">

                    {/* Company Info Tab */}
                    {activeTab === 'company' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700">{t('settings.company.title') || 'Company Information'}</h2>
                                <p className="text-slate-500 text-sm mt-1">{t('settings.company.subtitle') || 'Details about your organization.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.name') || 'Company Name'}
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.companyName || ''}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.address') || 'Address'}
                                    </label>
                                    <input
                                        type="text"
                                        id="companyAddress"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.companyAddress || ''}
                                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyPhone" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.phone') || 'Phone'}
                                    </label>
                                    <input
                                        type="text"
                                        id="companyPhone"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.companyPhone || ''}
                                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyEmail" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.email') || 'Email'}
                                    </label>
                                    <input
                                        type="email"
                                        id="companyEmail"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.companyEmail || ''}
                                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.website') || 'Website'}
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.website || ''}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="taxId" className="block text-sm font-medium text-slate-700">
                                        {t('settings.company.taxId') || 'Tax ID'}
                                    </label>
                                    <input
                                        type="text"
                                        id="taxId"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.taxId || ''}
                                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-slate-700">
                                    {t('settings.company.logo') || 'Company Logo'}
                                </label>
                                <div className="mt-2 flex items-center space-x-4">
                                    {logoPreview ? (
                                        <div className="relative w-24 h-24 border border-slate-300 rounded-md flex items-center justify-center overflow-hidden">
                                            <img src={logoPreview} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                                aria-label={t('settings.company.removeLogo') || 'Remove logo'}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 border border-slate-300 rounded-md flex items-center justify-center text-slate-400">
                                            <FaImage className="text-3xl" />
                                        </div>
                                    )}
                                    <label className="flex-grow">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                        />
                                        <span className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
                                            {t('settings.company.uploadLogo') || 'Upload Logo'}
                                        </span>
                                    </label>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                    {t('settings.company.logoHint') || 'PNG or JPG up to 2MB. Recommended size: 200x200px.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Regional Settings Tab */}
                    {activeTab === 'regional' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700">{t('settings.regional.title') || 'Regional Settings'}</h2>
                                <p className="text-slate-500 text-sm mt-1">{t('settings.regional.subtitle') || 'Configure locale, currency, and time.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="language" className="block text-sm font-medium text-slate-700">
                                        {t('settings.regional.language') || 'Language'}
                                    </label>
                                    <select
                                        id="language"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.language || 'en'}
                                        onChange={(e) => handleInputChange('language', e.target.value)}
                                    >
                                        <option value="en">{t('settings.regional.lang.en') || 'English'}</option>
                                        <option value="es">{t('settings.regional.lang.es') || 'Spanish'}</option>
                                        <option value="fr">{t('settings.regional.lang.fr') || 'French'}</option>
                                        <option value="de">{t('settings.regional.lang.de') || 'German'}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
                                        {t('settings.regional.currency') || 'Currency'}
                                    </label>
                                    <select
                                        id="currency"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.currency || 'USD'}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                    >
                                        <option value="USD">USD - United States Dollar</option>
                                        <option value="PEN">PEN - Peruvian Sol</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="MXN">MXN - Mexican Peso</option>
                                        <option value="COP">COP - Colombian Peso</option>
                                        <option value="ARS">ARS - Argentine Peso</option>
                                        <option value="CLP">CLP - Chilean Peso</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="timeZone" className="block text-sm font-medium text-slate-700">
                                        {t('settings.regional.timezone') || 'Time Zone'}
                                    </label>
                                    <select
                                        id="timeZone"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.timeZone || 'UTC'}
                                        onChange={(e) => handleInputChange('timeZone', e.target.value)}
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">America/New_York</option>
                                        <option value="America/Lima">America/Lima</option>
                                        <option value="Europe/London">Europe/London</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dateFormat" className="block text-sm font-medium text-slate-700">
                                        {t('settings.regional.dateFormat') || 'Date Format'}
                                    </label>
                                    <select
                                        id="dateFormat"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.dateFormat || 'YYYY-MM-DD'}
                                        onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                                    >
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2023-01-25)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g., 01/25/2023)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g., 25/01/2023)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Settings Tab */}
                    {activeTab === 'system' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700">{t('settings.system.title') || 'System Preferences'}</h2>
                                <p className="text-slate-500 text-sm mt-1">{t('settings.system.subtitle') || 'General system behavior and defaults.'}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="defaultCheckInTime" className="block text-sm font-medium text-slate-700">
                                        {t('settings.system.checkInTime') || 'Default Check-in Time'}
                                    </label>
                                    <input
                                        type="time"
                                        id="defaultCheckInTime"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.defaultCheckInTime || '15:00'}
                                        onChange={(e) => handleInputChange('defaultCheckInTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="defaultCheckOutTime" className="block text-sm font-medium text-slate-700">
                                        {t('settings.system.checkOutTime') || 'Default Check-out Time'}
                                    </label>
                                    <input
                                        type="time"
                                        id="defaultCheckOutTime"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.defaultCheckOutTime || '11:00'}
                                        onChange={(e) => handleInputChange('defaultCheckOutTime', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="maxGuestsPerRoom" className="block text-sm font-medium text-slate-700">
                                        {t('settings.system.maxGuests') || 'Max Guests per Room'}
                                    </label>
                                    <input
                                        type="number"
                                        id="maxGuestsPerRoom"
                                        min="1"
                                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        value={formData.maxGuestsPerRoom || 4}
                                        onChange={(e) => handleInputChange('maxGuestsPerRoom', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="enableOnlineBookings" className="block text-sm font-medium text-slate-700">
                                        {t('settings.system.onlineBookings') || 'Enable Online Bookings'}
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="checkbox"
                                            id="enableOnlineBookings"
                                            className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                            checked={formData.enableOnlineBookings || false}
                                            onChange={(e) => setFormData({ ...formData, enableOnlineBookings: e.target.checked })}
                                        />
                                        <span className="ml-2 text-sm text-slate-700">{t('settings.system.enableOnlineBookingsDesc') || 'Allow guests to book rooms directly from your website.'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-200">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            disabled={updateMutation.isLoading}
                        >
                            <FaSave className="mr-2 -ml-1" />
                            {updateMutation.isLoading ? (t('common.saving') || 'Saving...') : (t('common.saveChanges') || 'Save Changes')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};



export default SettingsPage;
