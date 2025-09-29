import React, { useState } from 'react';
import type { CreateDataEntryRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DataEntryFormProps {
  onSubmit: (data: CreateDataEntryRequest) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<CreateDataEntryRequest>;
  isLoading?: boolean;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateDataEntryRequest>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    value: initialData?.value || 0,
    // Remove createdBy
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.value < 0) {
      setError('Value must be non-negative');
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on successful submit
      setFormData({
        title: '',
        description: '',
        category: '',
        value: 0,
      });
    } catch (err) {
      setError('Failed to save data entry');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'value' ? parseFloat(value) || 0 : value,
    });
  };

  const categories = [
    'Sales',
    'Marketing',
    'Finance',
    'Operations',
    'HR',
    'Technology',
    'Other',
  ];

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>{initialData ? 'Edit Data Entry' : 'Create New Data Entry'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ color: '#000' }}>Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="category" style={{ color: '#000' }}>Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="value" style={{ color: '#000' }}>Value:</label>
          <input
            type="number"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="description" style={{ color: '#000' }}>Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginTop: '0.25rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DataEntryForm;