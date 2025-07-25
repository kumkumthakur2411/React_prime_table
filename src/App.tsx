
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type {
  DataTablePageEvent,
  DataTableSelectAllChangeEvent,

} from 'primereact/datatable';

import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';

import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

interface Fields {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  date_start: number;
  date_end: number;
}

interface APIResponse {
  data: Fields[];
  pagination: {
    total: number;
  };
}

export const App: React.FC = () => {
  const [apiData, setApiData] = useState<Fields[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [loader, setLoader] = useState<boolean>(false);
  const [lazyState, setLazyState] = useState<{ first: number; rows: number }>({
    first: 0,
    rows: 12,
  });

  const [selectedData, setSelectedData] = useState<Fields[] | null>(null);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [rowCount, setRowCount] = useState<string>('');
const [desiredSelectCount, setDesiredSelectCount] = useState<number>(0);
const [allSelected, setAllSelected] = useState<Fields[]>([])

  const toast = useRef<Toast>(null);
  const op = useRef<OverlayPanel>(null);


  //     const url = `https://api.artic.edu/api/v1/Fieldss?page=${pageNumber}&limit=${limit}`;

  useEffect(() => {
  const fetchApiData = async () => {
    setLoader(true);
    const pageNumber = lazyState.first / lazyState.rows + 1;
    const limit = lazyState.rows;

    try {
      const url = `https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data: APIResponse = await response.json();

      setApiData(data.data);
      setTotalData(data.pagination.total);

      if (desiredSelectCount > 0) {
        const newSelected = [...allSelected];

        for (const item of data.data) {
          const exists = newSelected.find((d) => d.id === item.id);
          if (!exists && newSelected.length < desiredSelectCount) {
            newSelected.push(item);
          }
        }

        setAllSelected(newSelected);

        const pageSelection = data.data.filter((d) =>
          newSelected.some((sel) => sel.id === d.id)
        );
        setSelectedData(pageSelection);
      }
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error in fetching data',
        detail: error.message || 'Unexpected error',
      });
    } finally {
      setLoader(false);
    }
  };

  fetchApiData();
}, [lazyState]);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState({ first: event.first, rows: event.rows });
  };

  const onSelectionChange = (e: DataTableSelectionChangeEvent<Fields[]>) => {
    setSelectedData(e.value);
  };


const onSelectAllChange = (e: DataTableSelectAllChangeEvent) => {
  setSelectAll(e.checked);

  if (e.checked) {
  
    const updatedSelection = [...allSelected];

    for (const item of apiData) {
      if (!updatedSelection.find((sel) => sel.id === item.id)) {
        updatedSelection.push(item);
      }
    }

    setAllSelected(updatedSelection);
    setSelectedData(apiData); 
  } else {

    const remainingSelection = allSelected.filter(
      (sel) => !apiData.find((item) => item.id === sel.id)
    );
    setAllSelected(remainingSelection);
    setSelectedData([]); 
  }
};


const handleRowSelection = () => {
  const count = parseInt(rowCount, 12);
  if (!isNaN(count) && count > 0) {
    setDesiredSelectCount(count);
    const selection = apiData.slice(0, count);
    setAllSelected(selection);
    setSelectedData(selection);
    op.current?.hide();
  } else {
    toast.current?.show({
      severity: 'warn',
      summary: 'Invalid ',
      detail: 'please provide valid number',
    });
  }
};


  return (
    <div className="card">
      <Toast ref={toast} />

      <OverlayPanel ref={op}>
        <div style={{  width: '150px',  }}>
          
          <input
            id="rowInput"
            type="number"
            placeholder='select rows...'
            className="p-inputtext p-component"
            value={rowCount}
            onChange={(e) => setRowCount(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <Button
            label="Submit"
            
            className="p-button-sm p-button-text "
            onClick={handleRowSelection}
            
          />
        </div>
      </OverlayPanel>

      {loader && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem' }}>
          <ProgressSpinner style={{ width: '40px', height: '40px' }} />
        </div>
      )}

      <DataTable
        value={apiData}
        lazy
        dataKey="id"
        paginator
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalData}
        onPage={onPage}
        loading={loader}
        tableStyle={{ minWidth: '75rem' }}
        selection={selectedData}
        onSelectionChange={onSelectionChange}
        selectAll={selectAll}
        onSelectAllChange={onSelectAllChange}
      >
        <Column 
          selectionMode="multiple"           
          headerStyle={{ width: '2rem' }} />
        <Column           
        header={
            
        <Button 
        type="button"
        icon="pi pi-angle-down"        
        className="p-button-sm p-button-text"
        onClick={(e) => op.current?.toggle(e)}
      />} 
      body={()=>null}
      style={{width: '1rem'}}
      exportable={false}
      ></Column>  
        <Column 
          field="title" 
          header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default App;
