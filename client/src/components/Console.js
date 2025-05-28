import React, { useState } from 'react';
import './Console.css';

const Console = () => {
  const [contacts, setContacts] = useState([
    { id: 1, phone: '+15551234567', name: 'John Doe', dateClosed: '2023-07-15', autoSend: true },
    { id: 2, phone: '+15559876543', name: 'Jane Smith', dateClosed: '2023-08-20', autoSend: false },
    { id: 3, phone: '+15552223333', name: 'Bob Johnson', dateClosed: '2023-09-10', autoSend: true },
  ]);

  const [editingCell, setEditingCell] = useState({ rowId: null, field: null });

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
      phone: '',
      name: '',
      dateClosed: new Date().toISOString().split('T')[0],
      autoSend: false
    };
    setContacts([...contacts, newContact]);
    // Set the new row's phone field to be in edit mode
    setEditingCell({ rowId: newId, field: 'phone' });
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
          <div className="header-cell">Actions</div>
        </div>
        
        <div className="table-body">
          {contacts.map(contact => (
            <div key={contact.id} className="table-row">
              <div className="table-cell">
                {editingCell.rowId === contact.id && editingCell.field === 'phone' ? (
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
                )}
              </div>
              
              <div className="table-cell">
                {editingCell.rowId === contact.id && editingCell.field === 'name' ? (
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
                )}
              </div>
              
              <div className="table-cell">
                {editingCell.rowId === contact.id && editingCell.field === 'dateClosed' ? (
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
                )}
              </div>
              
              <div className="table-cell toggle-cell">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={contact.autoSend}
                    onChange={() => handleToggle(contact.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="table-cell action-cell">
                <button className="send-button">
                  Send
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDelete(contact.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
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