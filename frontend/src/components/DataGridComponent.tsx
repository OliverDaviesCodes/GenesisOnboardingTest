import React, { useState, useEffect } from 'react';
import DataGrid, { Column, Editing, Paging, SearchPanel, Summary, TotalItem } from 'devextreme-react/data-grid';
import type { DataEntry, UpdateDataEntryRequest } from '../types';
import { dataEntriesApi } from '../services/api';

interface DataGridComponentProps {
  refreshTrigger?: number;
}

const DataGridComponent: React.FC<DataGridComponentProps> = ({ refreshTrigger = 0 }) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await dataEntriesApi.getAll();
      setDataEntries(data);
    } catch (error) {
      console.error('Failed to load data entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const handleRowUpdating = async (e: any) => {
    try {
      const updateData: UpdateDataEntryRequest = {
        title: e.newData.title ?? e.oldData.title,
        description: e.newData.description ?? e.oldData.description,
        category: e.newData.category ?? e.oldData.category,
        value: e.newData.value ?? e.oldData.value,
      };

      await dataEntriesApi.update(e.oldData.id, updateData);
      
      // Update local state
      setDataEntries(prev => 
        prev.map(item => 
          item.id === e.oldData.id 
            ? { ...item, ...updateData, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to update entry:', error);
      throw error; // This will show an error in the grid
    }
  };

  const handleRowRemoving = async (e: any) => {
    try {
      await dataEntriesApi.delete(e.data.id);
      
      // Update local state
      setDataEntries(prev => prev.filter(item => item.id !== e.data.id));
    } catch (error) {
      console.error('Failed to delete entry:', error);
      throw error;
    }
  };

  const categories = ['Sales', 'Marketing', 'Finance', 'Operations', 'HR', 'Technology', 'Other'];

  return (
    <div style={{ padding: '2rem' }}>
      <h3>Data Entries</h3>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <DataGrid
          dataSource={dataEntries}
          keyExpr="id"
          showBorders={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          onRowUpdating={handleRowUpdating}
          onRowRemoving={handleRowRemoving}
        >
        <SearchPanel visible={true} highlightCaseSensitive={true} />
        <Paging defaultPageSize={20} />
        
        <Editing
          mode="row"
          allowUpdating={true}
          allowDeleting={true}
          confirmDelete={true}
        />

        <Column 
          dataField="title" 
          caption="Title" 
          allowEditing={true}
          validationRules={[{ type: 'required' }]}
        />
        
        <Column 
          dataField="category" 
          caption="Category" 
          allowEditing={true}
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
          allowEditing={true}
          validationRules={[
            { type: 'required' },
            { type: 'range', min: 0, message: 'Value must be non-negative' }
          ]}
        />
        
        <Column 
          dataField="description" 
          caption="Description" 
          allowEditing={true}
          cellTemplate={(cellData) => (
            <div title={cellData.value}>
              {cellData.value?.length > 50 
                ? cellData.value.substring(0, 50) + '...' 
                : cellData.value}
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
      )}
    </div>
  );
};

export default DataGridComponent;