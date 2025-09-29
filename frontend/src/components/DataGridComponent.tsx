import React, { useState, useEffect } from 'react';
import DataGrid, { Column, Editing, Paging, SearchPanel, Summary, TotalItem } from 'devextreme-react/data-grid';
import type { DataEntry, UpdateDataEntryRequest } from '../types';
import { dataEntriesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // <-- Add this import

interface DataGridComponentProps {
  refreshTrigger?: number;
  mode?: 'personal' | 'all'; // <-- Add this line
}

const DataGridComponent: React.FC<DataGridComponentProps> = (props) => {
  const { refreshTrigger = 0, mode = 'personal' } = props;
  const { user } = useAuth(); // <-- Add this line
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = mode === 'all'
        ? await dataEntriesApi.getAllUsers()
        : await dataEntriesApi.getAll();
      setDataEntries(data);
    } catch (error) {
      console.error('Failed to load data entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger, mode]);

  const handleRowUpdating = async (e: any) => {
    if (mode !== 'personal') return;
    try {
      const updateData: UpdateDataEntryRequest = {
        title: e.newData.title ?? e.oldData.title,
        description: e.newData.description ?? e.oldData.description,
        category: e.newData.category ?? e.oldData.category,
        value: e.newData.value ?? e.oldData.value
      };

      const updatedEntry = await dataEntriesApi.update(e.oldData.id, updateData);

      setDataEntries(prev =>
        prev.map(item =>
          item.id === e.oldData.id
            ? { ...item, ...updatedEntry }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error;
    }
  };

  const handleRowRemoving = async (e: any) => {
    if (mode !== 'personal') return;
    try {
      await dataEntriesApi.delete(e.data.id);
      setDataEntries(prev => prev.filter(item => item.id !== e.data.id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  };

  const categories = ['Sales', 'Marketing', 'Finance', 'Operations', 'HR', 'Technology', 'Other'];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      <DataGrid
        dataSource={dataEntries}
        keyExpr="id"
        showBorders={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
        onRowUpdating={mode === 'personal' ? handleRowUpdating : undefined}
        onRowRemoving={mode === 'personal' ? handleRowRemoving : undefined}
      >
        <SearchPanel visible={true} highlightCaseSensitive={true} />
        <Paging defaultPageSize={20} />

        {mode === 'personal' && (
          <Editing
            mode="row"
            allowUpdating={true}
            allowDeleting={true}
            confirmDelete={true}
          />
        )}

        <Column 
          dataField="title" 
          caption="Title" 
          allowEditing={mode === 'personal'}
          validationRules={[{ type: 'required' }]}
        />
        <Column 
          dataField="category" 
          caption="Category" 
          allowEditing={mode === 'personal'}
          validationRules={[{ type: 'required' }]}
          lookup={{
            dataSource: categories.map(cat => ({ value: cat, text: cat })),
            displayExpr: 'text',
            valueExpr: 'value'
          }}
        />
        <Column 
          dataField="value" 
          caption="Value" 
          dataType="number"
          format="currency"
          allowEditing={mode === 'personal'}
          validationRules={[
            { type: 'required' },
            { type: 'range', min: 0, message: 'Value must be non-negative' }
          ]}
        />
        <Column 
          dataField="description" 
          caption="Description" 
          allowEditing={mode === 'personal'}
          cellRender={({ value }) => (
            <div title={value}>
              {value && value.length > 50 ? value.substring(0, 50) + '...' : value}
            </div>
          )}
        />
        <Column 
          dataField="createdAt" 
          caption="Created" 
          dataType="datetime"
          allowEditing={false}
          format="MM/dd/yyyy HH:mm"
        />
        <Column 
          dataField="updatedAt" 
          caption="Updated" 
          dataType="datetime"
          allowEditing={false}
          format="MM/dd/yyyy HH:mm"
        />
        <Column 
          dataField="createdBy" 
          caption="Created By" 
          allowEditing={false}
          cellRender={({ value }) => value || `${user?.name}`}
/>
        <Summary>
          <TotalItem
            column="value"
            summaryType="sum"
            displayFormat="Total: {0}"
            valueFormat="currency"
          />
          <TotalItem
            column="id"
            summaryType="count"
            displayFormat="Count: {0}"
          />
        </Summary>
      </DataGrid>
    </div>
  );
};

export default DataGridComponent;