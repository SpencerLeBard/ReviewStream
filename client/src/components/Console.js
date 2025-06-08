import React, { useState } from 'react';
import './Console.css';

const Console = () => {
  const [contacts, setContacts] = useState([
    { id: 1, phone: '+2082302474', name: 'Spencer LeBard', dateClosed: '2025-07-25', status: 'New Number', autoSend: true },
    { id: 2, phone: '+15559876543', name: 'Jane Smith', dateClosed: '2023-08-20', status: 'Unresponded', autoSend: false },
    { id: 3, phone: '+15552223333', name: 'Bob Johnson', dateClosed: '2023-09-10', status: 'New Number', autoSend: true },
  ]);

  const [editingCell, setEditingCell] = useState({ rowId: null, field: null });
  
  // Status options for dropdown
  const statusOptions = ['New Number', 'Sent', 'Unresponded'];

  // Function to handle cell editing
  const handleCellEdit = (id, field, value) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  // Function to handle toggle switch change
  const handleToggle = (id) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, autoSend: !contact.autoSend } : contact
    ));
  };

  // Function to delete a row
  const handleDelete = (id) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  // Function to add a new row
  const handleAddRow = () => {
    const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
    const newContact = {
      id: newId,
      phone: '+2082302474',
      name: '',
      dateClosed: new Date().toISOString().split('T')[0],
      status: 'New Number',
      autoSend: false,
      phoneLocked: true
    };
    setContacts([...contacts, newContact]);
    // Set the new row's name field to be in edit mode
    setEditingCell({ rowId: newId, field: 'name' });
  };

  // Hardcoded send button
  const handleSendFirstRow = async () => {
    try {
      const response = await fetch('/api/send-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerPhone: '+12082302474' })
      });
      if (!response.ok) throw new Error('Failed to send review request');
      alert('Sent!');
    } catch (err) {
      alert('Error sending review request: ' + err.message);
    }
  };

  return (
    <div className="console-container">
      <h1 className="console-title">Review Management Console</h1>
      
      <div className="console-table">
        <div className="table-header">
          <div className="header-cell">Phone</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Date Closed</div>
          <div className="header-cell">Auto Send</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        <div className="table-body">
          {contacts.map((contact, idx) => {
            const isFirstRow = idx === 0;
            return (
              <div key={contact.id} className={`table-row${isFirstRow ? ' table-row-disabled' : ''}`}>
                <div className="table-cell">
                  {isFirstRow || contact.phoneLocked ? (
                    <div className="editable-cell disabled-cell">{contact.phone}</div>
                  ) : (
                    editingCell.rowId === contact.id && editingCell.field === 'phone' ? (
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => handleCellEdit(contact.id, 'phone', e.target.value)}
                        onBlur={() => setEditingCell({ rowId: null, field: null })}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="editable-cell"
                        onClick={() => setEditingCell({ rowId: contact.id, field: 'phone' })}
                      >
                        {contact.phone || 'Click to edit'}
                      </div>
                    )
                  )}
                </div>
                
                <div className="table-cell">
                  {isFirstRow ? (
                    <div className="editable-cell disabled-cell">{contact.name}</div>
                  ) : (
                    editingCell.rowId === contact.id && editingCell.field === 'name' ? (
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleCellEdit(contact.id, 'name', e.target.value)}
                        onBlur={() => setEditingCell({ rowId: null, field: null })}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="editable-cell"
                        onClick={() => setEditingCell({ rowId: contact.id, field: 'name' })}
                      >
                        {contact.name || 'Click to edit'}
                      </div>
                    )
                  )}
                </div>
                
                <div className="table-cell">
                  {isFirstRow ? (
                    <div className="editable-cell disabled-cell">{contact.dateClosed}</div>
                  ) : (
                    editingCell.rowId === contact.id && editingCell.field === 'dateClosed' ? (
                      <input
                        type="date"
                        value={contact.dateClosed}
                        onChange={(e) => handleCellEdit(contact.id, 'dateClosed', e.target.value)}
                        onBlur={() => setEditingCell({ rowId: null, field: null })}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="editable-cell"
                        onClick={() => setEditingCell({ rowId: contact.id, field: 'dateClosed' })}
                      >
                        {contact.dateClosed || 'Click to edit'}
                      </div>
                    )
                  )}
                </div>
                
                <div className="table-cell toggle-cell">
                  {isFirstRow ? (
                    <label className="toggle-switch disabled-cell">
                      <input
                        type="checkbox"
                        checked={contact.autoSend}
                        disabled
                        readOnly
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  ) : (
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={contact.autoSend}
                        onChange={() => handleToggle(contact.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  )}
                </div>
                
                <div className="table-cell">
                  {isFirstRow ? (
                    <div className="editable-cell disabled-cell">{contact.status}</div>
                  ) : (
                    editingCell.rowId === contact.id && editingCell.field === 'status' ? (
                      <select
                        value={contact.status}
                        onChange={(e) => handleCellEdit(contact.id, 'status', e.target.value)}
                        onBlur={() => setEditingCell({ rowId: null, field: null })}
                        autoFocus
                      >
                        {statusOptions.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div 
                        className="editable-cell"
                        onClick={() => setEditingCell({ rowId: contact.id, field: 'status' })}
                      >
                        {contact.status || 'Click to edit'}
                      </div>
                    )
                  )}
                </div>
                
                <div className="table-cell action-cell">
                  <button
                    className="send-button"
                    onClick={isFirstRow ? handleSendFirstRow : undefined}
                  >
                    Send
                  </button>
                  {!isFirstRow && (
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(contact.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="add-row-container">
        <button className="add-row-button" onClick={handleAddRow}>
          +
        </button>
      </div>
    </div>
  );
};

export default Console; 