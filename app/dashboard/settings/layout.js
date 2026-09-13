import SettingsTabs from './SettingsTabs';

export default function SettingsLayout({ children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <SettingsTabs />
      {children}
    </div>
  );
}
