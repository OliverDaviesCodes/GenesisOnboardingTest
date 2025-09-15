import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataEntryForm from '../components/DataEntryForm';
import DataGridComponent from '../components/DataGridComponent';
import { dataEntriesApi } from '../services/api';
import type { CreateDataEntryRequest } from '../types';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDataEntry = async (data: CreateDataEntryRequest) => {
    setIsLoading(true);
    try {
      await dataEntriesApi.create(data);
      setRefreshTrigger(prev => prev + 1); // Trigger data grid refresh
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create data entry:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#343a40',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1>Genesis Onboarding App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ padding: '2rem' }}>
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
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            {showForm ? 'Hide Form' : 'Add New Entry'}
          </button>
          
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Refresh Data
          </button>
        </div>

        {/* Data entry form */}
        {showForm && (
          <DataEntryForm
            onSubmit={handleCreateDataEntry}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        )}

        {/* Data grid */}
        <DataGridComponent refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
};

export default Dashboard;