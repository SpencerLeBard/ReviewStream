import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import './StylingUtility.css';
import { useSession } from '@supabase/auth-helpers-react';

// Options for the status dropdown
const statusOptions = ['New Number', 'Sent', 'Unresponded'];

/**
 * Formats a date string into a more readable format.
 * @param {string} d - The date string to format.
 * @returns {string} The formatted date or 'N/A'.
 */
const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function Console() {
  // --- STATE MANAGEMENT ---
  const [rows, setRows]    = useState([]); // Stores the list of contacts
  const [editing, setEdit] = useState({ id: null, field: null }); // Tracks which cell is being edited
  const [editValue, setEditValue] = useState(''); // Holds the temporary value of the cell being edited
  const [company, setCompany] = useState(null); // Stores the current user's company info
  const [loadingCompany, setLoadingCompany] = useState(true); // Loading state for company data
  const [newRow, setNewRow] = useState(null); // Holds data for a new contact being added
  const session = useSession(); // Supabase auth session

  // --- DATA FETCHING ---

  // Fetch all contacts from the database when the component mounts
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('contacts').select('*').order('created_at');
      if (data) setRows(data);
    })();
  }, []);

  // Fetch the user's company information when the session becomes available
  useEffect(() => {
    if (!session) {
      setLoadingCompany(false);
      return;
    }
    setLoadingCompany(true);
    (async () => {
      try {
        const r = await fetch('/api/secure/users/company', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (r.ok) {
          const companyData = await r.json();
          setCompany(companyData);
        }
      } catch (e) {
        console.error("Failed to fetch company", e);
      } finally {
        setLoadingCompany(false);
      }
    })();
  }, [session]);

  // --- CRUD OPERATIONS & EVENT HANDLERS ---

  /**
   * Updates a contact in the database and reflects the change in the local state.
   * @param {string} id - The ID of the contact to update.
   * @param {object} obj - An object containing the fields to update.
   */
  const patch = useCallback(async (id, obj) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...obj, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    if (data) setRows(r => r.map(row => (row.id === id ? data : row)));
  }, []);

  /**
   * Initializes a new row in the UI for adding a new contact.
   */
  const addRow = useCallback(() => {
    if (newRow) return;
    setNewRow({
      phone: '',
      name: '',
      auto_send: false,
      status: 'New Number',
    });
  }, [newRow]);

  /**
   * Handles changes to the input fields for the new row.
   */
  const handleNewRowChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewRow(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  /**
   * Cancels the process of adding a new row.
   */
  const handleCancelNewRow = useCallback(() => {
    setNewRow(null);
  }, []);

  /**
   * Saves the new contact to the database and adds it to the local state.
   */
  const handleSaveNewRow = useCallback(async () => {
    if (!company) {
      alert('Company information is not available. Please try again.');
      return;
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...newRow, company_id: company.id }])
      .select()
      .single();

    if (error) {
      alert(`Error saving contact: ${error.message}`);
    } else if (data) {
      // Add the new row to the state without re-fetching all data
      setRows(r => [...r, data]);
      setNewRow(null);
    }
  }, [company, newRow]);

  /**
   * Deletes a contact after user confirmation.
   * @param {string} id - The ID of the contact to delete.
   */
  const delRow = useCallback(async id => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) throw error;
        setRows(r => r.filter(row => row.id !== id));
      } catch (error) {
        alert(`Error deleting contact: ${error.message}`);
      }
    }
  }, []);

  /**
   * Sends a review request SMS to a contact.
   * @param {string} id - The contact's ID.
   * @param {string} phone - The contact's phone number.
   */
  const sendSms = useCallback(async (id, phone) => {
    console.log(`sendSms called with id: ${id}, phone: ${phone}`);

    if (!company) {
      alert('Company information could not be loaded. Please refresh and try again.');
      console.error('Company not loaded');
      return;
    }
    console.log('Company is loaded, proceeding to send.');

    try {
      const res = await fetch(`/api/companies/${company.id}/send-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerPhone: phone })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errData.error || 'Failed to send review request');
      }

      await patch(id, { status: 'Sent', last_date_sent: new Date().toISOString() });
      alert('Sent!');

    } catch (error) {
      console.error('Error sending SMS or updating contact:', error);
      alert(`Error: ${error.message}`);
    }
  }, [company, patch]);

  // --- RENDER LOGIC ---

  /**
   * Renders a table cell, handling inline editing logic.
   * @param {object} row - The data for the current row.
   * @param {string} field - The key of the data to be displayed/edited.
   * @param {string} [type='text'] - The input type for editing.
   * @returns {JSX.Element} The rendered table cell.
   */
  const renderCell = (row, field, type='text') => {
    // Lock the first row from being edited
    if (row.locked) return <div className="editable-cell disabled-cell">{row[field]}</div>;

    // If the cell is in edit mode, render an input or select dropdown
    if (editing.id === row.id && editing.field === field) {
      if (field === 'status') {
        return (
          <select
            value={row.status}
            onChange={e => patch(row.id, { status: e.target.value })}
            onBlur={() => setEdit({ id: null, field: null })}
            autoFocus
          >
            {statusOptions.map(o => <option key={o}>{o}</option>)}
          </select>
        );
      }
      
      // Saves the change on blur or 'Enter', reverts on 'Escape'
      const handleUpdate = () => {
        if (editValue !== row[field]) {
            patch(row.id, { [field]: editValue });
        }
        setEdit({ id: null, field: null });
      };

      return (
        <input
          type={type}
          value={editValue || ''}
          onChange={e => setEditValue(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate();
            else if (e.key === 'Escape') setEdit({ id: null, field: null });
          }}
          autoFocus
        />
      );
    }

    // Default view: display text, enter edit mode on click
    return (
      <div
        className="editable-cell"
        onClick={() => {
            setEdit({ id: row.id, field });
            setEditValue(row[field] || '');
        }}
      >
        {row[field] || 'Click to edit'}
      </div>
    );
  };

  return (
    <div className="home-container">
      <header className="hero">
        <div className="hero-content">
          <h1 className="heading">Review Management Console</h1>
          <p className="subheading">
            Manage your customer contacts and send review requests.
          </p>
        </div>
      </header>

      <section className="testimonials-section">
        <div className="console-table">
          {/* Table Header */}
          <div className="table-header">
            <div className="header-cell">Phone</div>
            <div className="header-cell">Name</div>
            <div className="header-cell">Last Date Sent</div>
            <div className="header-cell">Auto Send</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>

          {/* Table Body */}
          <div className="table-body">
            {/* Render existing contact rows */}
            {rows.map((row, index) => {
              const isFirstRow = index === 0;
              const displayRow = { ...row, locked: isFirstRow };

              return (
                <div key={row.id} className="table-row">
                  <div className="table-cell">{renderCell(displayRow,'phone')}</div>
                  <div className="table-cell">{renderCell(displayRow,'name')}</div>
                  <div className="table-cell">{formatDate(row.last_date_sent)}</div>

                  <div className="table-cell">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={row.auto_send}
                        disabled={isFirstRow}
                        onChange={() => !isFirstRow && patch(row.id,{auto_send:!row.auto_send})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="table-cell">{renderCell(displayRow,'status')}</div>

                  <div className="table-cell action-cell">
                    <button
                      className="send-button"
                      disabled={loadingCompany}
                      onClick={() => sendSms(row.id, row.phone)}
                    >{row.status === 'New Number' ? 'Send' : 'Resend'}</button>
                    {!isFirstRow && (
                      <button className="delete-button" onClick={() => delRow(row.id)}>✕</button>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Render the new row form if active */}
            {newRow && (
              <div className="table-row">
                <div className="table-cell">
                  <input type="tel" name="phone" value={newRow.phone} onChange={handleNewRowChange} placeholder="+15551234567" />
                </div>
                <div className="table-cell">
                  <input type="text" name="name" value={newRow.name} onChange={handleNewRowChange} placeholder="Name" />
                </div>
                <div className="table-cell">N/A</div>
                <div className="table-cell">
                  <label className="toggle-switch">
                    <input type="checkbox" name="auto_send" checked={newRow.auto_send} onChange={handleNewRowChange} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="table-cell">
                  <select name="status" value={newRow.status} onChange={handleNewRowChange}>
                    {statusOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="table-cell action-cell">
                  {newRow.phone && newRow.name && (
                    <button className="send-button" onClick={handleSaveNewRow}>✓</button>
                  )}
                  <button className="delete-button" onClick={handleCancelNewRow}>✕</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add New Row Button */}
        <div className="add-row-container">
          <button className="add-row-button" onClick={addRow}>+</button>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 ReviewStream. All rights reserved.</p>
      </footer>
    </div>
  );
}
