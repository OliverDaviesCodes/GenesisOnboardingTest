import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataEntryForm from '../components/DataEntryForm';
import DataGridComponent from '../components/DataGridComponent';
import { dataEntriesApi } from '../services/api';
import type { CreateDataEntryRequest } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allRefreshTrigger, setAllRefreshTrigger] = useState(0); // <-- Add this
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.info('[Dashboard] user from context:', user);
  }, [user]);

  const handleCreateDataEntry = async (data: CreateDataEntryRequest) => {
    setIsLoading(true);
    try {
      await dataEntriesApi.create(data);
      setRefreshTrigger(prev => prev + 1);
      setAllRefreshTrigger(prev => prev + 1); // <-- Refresh all grid too
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create data entry:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setAllRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(90deg, #343a40 60%, #495057 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
      }}>
        <h1 style={{ margin: 0, fontWeight: 700, letterSpacing: 1 }}>Genesis Onboarding App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span>
            Welcome, <strong>{user?.name}</strong>
          </span>
          <button
            onClick={logout}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'linear-gradient(90deg, #dc3545 60%, #c82333 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '2.5rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
        {/* Action buttons */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '0.9rem 2rem',
              background: 'linear-gradient(90deg, #28a745 60%, #218838 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            {showForm ? 'Cancel' : 'Add New Entry'}
          </button>
          <button
            onClick={handleRefresh}
            style={{
              padding: '0.9rem 2rem',
              background: 'linear-gradient(90deg, #17a2b8 60%, #138496 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1.1rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            Refresh Data
          </button>
        </div>

        {/* Data entry form */}
        {showForm && (
          <div style={{
            marginBottom: '2.5rem',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: '2rem',
            maxWidth: 600,
          }}>
            <DataEntryForm
              onSubmit={handleCreateDataEntry}
              onCancel={() => setShowForm(false)}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Grids stacked vertically */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#343a40' }}>My Entries (Editable)</h2>
            <DataGridComponent refreshTrigger={refreshTrigger} mode="personal" />
          </div>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#343a40' }}>All Entries (Read Only)</h2>
            <DataGridComponent refreshTrigger={allRefreshTrigger} mode="all" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;