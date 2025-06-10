import React, { useState } from 'react';
import './Console.css';
import './Settings.css';

const Settings = () => {
  const [globalAutoSend, setGlobalAutoSend] = useState(false);
  const [autoSendReminders, setAutoSendReminders] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [useDefaultMessage, setUseDefaultMessage] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  
  // Company name placeholder - would come from your app state or API
  const companyName = 'Spencer\'s Company';
  const defaultMessage = `Thanks for visiting ${companyName}. Reply with 1-5 stars and feedback.`;

  // Toggle between default and custom message
  const handleMessageToggle = (isDefault) => {
    setUseDefaultMessage(isDefault);
  };

  return (
    <div className="console-container">
      <h1 className="console-title">Settings</h1>
      
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
    </div>
  );
};

export default Settings; 