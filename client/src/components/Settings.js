import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useToast } from './ToastProvider';
import './StylingUtility.css';

const Settings = () => {
  const session = useSession();
  const { showToast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [globalAutoSend, setGlobalAutoSend] = useState(false);
  const [autoSendReminders, setAutoSendReminders] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [useDefaultMessage, setUseDefaultMessage] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);
  
  useEffect(() => {
    if (session) {
      fetch('/api/secure/users/company', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then(res => {
          if (!res.ok) {
            console.error('Failed to fetch company data:', res.status, res.statusText);
            res.json().then(errorData => console.error('Error details:', errorData));
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data) {
            const fetchedSettings = {
              name: data.name || '',
              global_auto_send: data.global_auto_send || false,
              auto_send_reminders: data.auto_send_reminders || false,
              wait_period_days: data.wait_period_days || 0,
              wait_period_hours: data.wait_period_hours || 0,
              use_default_message: data.use_default_message !== false,
              custom_message: data.custom_message || ''
            };
            // Set form state
            setCompanyName(fetchedSettings.name);
            setGlobalAutoSend(fetchedSettings.global_auto_send);
            setAutoSendReminders(fetchedSettings.auto_send_reminders);
            setDays(fetchedSettings.wait_period_days);
            setHours(fetchedSettings.wait_period_hours);
            setUseDefaultMessage(fetchedSettings.use_default_message);
            setCustomMessage(fetchedSettings.custom_message);
            
            // Store original settings to track changes
            setOriginalSettings(fetchedSettings);
          } else {
            console.log('Received null data from server.');
          }
        })
        .catch(err => console.error('Fetch error:', err));
    }
  }, [session]);

  const isDirty = useMemo(() => {
    if (!originalSettings) return false;
    if (originalSettings.global_auto_send !== globalAutoSend) return true;
    if (originalSettings.auto_send_reminders !== autoSendReminders) return true;
    if (originalSettings.wait_period_days !== days) return true;
    if (originalSettings.wait_period_hours !== hours) return true;
    if (originalSettings.use_default_message !== useDefaultMessage) return true;
    if (originalSettings.custom_message !== customMessage) return true;
    return false;
  }, [originalSettings, globalAutoSend, autoSendReminders, days, hours, useDefaultMessage, customMessage]);

  const defaultMessage = `Thanks for visiting ${companyName || 'your company'}. Reply with 1-5 stars and feedback.`;

  // Toggle between default and custom message
  const handleMessageToggle = (isDefault) => {
    setUseDefaultMessage(isDefault);
  };

  const handleSave = async () => {
    if (!session) {
      alert('You must be logged in to save settings.');
      return;
    }
    setIsSaving(true);
    console.log('--- Initiating Save ---');

    const settingsData = {
      global_auto_send: globalAutoSend,
      auto_send_reminders: autoSendReminders,
      wait_period_days: days,
      wait_period_hours: hours,
      use_default_message: useDefaultMessage,
      custom_message: customMessage,
    };

    console.log('Sending settings data:', settingsData);
    
    try {
      const url = '/api/secure/users/company';
      console.log('Requesting PUT to URL:', url);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(settingsData),
      });

      console.log('Received response from server:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Could not parse error JSON' }));
        console.error('Save failed! Response not OK.', 'Status:', response.status, 'Error Data:', errorData);
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Save successful! Response data:', responseData);

      // Update original settings to match the newly saved data
      const newOriginalSettings = {
        name: responseData.name || '',
        global_auto_send: responseData.global_auto_send || false,
        auto_send_reminders: responseData.auto_send_reminders || false,
        wait_period_days: responseData.wait_period_days || 0,
        wait_period_hours: responseData.wait_period_hours || 0,
        use_default_message: responseData.use_default_message !== false,
        custom_message: responseData.custom_message || ''
      };
      setOriginalSettings(newOriginalSettings);
      
      showToast('Settings saved successfully!');

    } catch (error) {
      console.error('Error during save process:', error);
      showToast(`Error: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
      console.log('--- Save Finished ---');
    }
  };

  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Settings</h1>
          <p className="subheading">
            Configure your company's review collection preferences.
          </p>
        </div>
      </header>

      <section className="testimonials-section">
        {isDirty && (
          <div className="save-button-container">
            <button onClick={handleSave} className="save-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
        <div className="settings-panel">
          <div className="setting-row">
            <div className="setting-label">Global Autosend</div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={globalAutoSend}
                  onChange={() => setGlobalAutoSend(!globalAutoSend)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-row">
            <div className="setting-label">Auto send reminders every 2 days</div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoSendReminders}
                  onChange={() => setAutoSendReminders(!autoSendReminders)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-row">
            <div className="setting-label">Wait Period</div>
            <div className="setting-control number-inputs">
              <div className="number-input-group">
                <input
                  type="number"
                  min="0"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                  className="number-input"
                />
                <span className="number-label">Days</span>
              </div>
              <div className="number-input-group">
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                  className="number-input"
                />
                <span className="number-label">Hours</span>
              </div>
            </div>
          </div>
          
          <div className="setting-row">
            <div className="setting-label">Default Message</div>
            <div className="setting-control message-control">
              <textarea
                value={defaultMessage}
                readOnly
                className="message-textarea disabled-textarea"
              />
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useDefaultMessage}
                  onChange={() => handleMessageToggle(true)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-row">
            <div className="setting-label">Custom Message</div>
            <div className="setting-control message-control">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your custom message here..."
                className={`message-textarea ${!useDefaultMessage ? '' : 'disabled-textarea'}`}
                disabled={useDefaultMessage}
              />
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={!useDefaultMessage}
                  onChange={() => handleMessageToggle(false)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 ReviewStream. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Settings; 