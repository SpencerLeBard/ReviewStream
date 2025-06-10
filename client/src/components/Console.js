import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Console.css';
import { useSession } from '@supabase/auth-helpers-react';

const statusOptions = ['New Number', 'Sent', 'Unresponded'];

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function Console() {
  const [rows, setRows]    = useState([]);
  const [editing, setEdit] = useState({ id: null, field: null });
  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [newRow, setNewRow] = useState(null);
  const session = useSession();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('contacts').select('*').order('created_at');
      if (data) setRows(data);
    })();
  }, []);

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

  const patch = async (id, obj) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...obj, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    
    if (data) setRows(r => r.map(row => (row.id === id ? data : row)));
  };

  const addRow = () => {
    if (newRow) return;
    setNewRow({
      phone: '',
      name: '',
      auto_send: false,
      status: 'New Number',
    });
  };

  const handleNewRowChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRow(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCancelNewRow = () => {
    setNewRow(null);
  };

  const handleSaveNewRow = async () => {
    if (!company) {
      alert('Company information is not available. Please try again.');
      return;
    }

    const { error } = await supabase
      .from('contacts')
      .insert([{ ...newRow, company_id: company.id }]);

    if (error) {
      alert(`Error saving contact: ${error.message}`);
    } else {
      setNewRow(null);
      const { data } = await supabase.from('contacts').select('*').order('created_at');
      if (data) setRows(data);
    }
  };

  const delRow = async id => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) throw error;
        setRows(r => r.filter(row => row.id !== id));
      } catch (error) {
        alert(`Error deleting contact: ${error.message}`);
      }
    }
  };

  const sendSms = async (id, phone) => {
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
  };

  const renderCell = (row, field, type='text') => {
    if (row.locked) return <div className="editable-cell disabled-cell">{row[field]}</div>;

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
      return (
        <input
          type={type}
          value={row[field] || ''}
          onChange={e => patch(row.id, { [field]: e.target.value })}
          onBlur={() => setEdit({ id: null, field: null })}
          autoFocus
        />
      );
    }

    return (
      <div
        className="editable-cell"
        onClick={() => setEdit({ id: row.id, field })}
      >
        {row[field] || 'Click to edit'}
      </div>
    );
  };

  return (
    <div className="console-container">
      <h1 className="console-title">Review Management Console</h1>

      <div className="console-table">
        <div className="table-header">
          <div className="header-cell">Phone</div>
          <div className="header-cell">Name</div>
          <div className="header-cell">Last Date Sent</div>
          <div className="header-cell">Auto Send</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
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
                  >Send</button>
                  {!isFirstRow && (
                    <button className="delete-button" onClick={() => delRow(row.id)}>✕</button>
                  )}
                </div>
              </div>
            );
          })}
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

      <div className="add-row-container">
        <button className="add-row-button" onClick={addRow}>+</button>
      </div>
    </div>
  );
}
