import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import type {
  DataTablePageEvent,
  DataTableSelectAllChangeEvent,

} from 'primereact/datatable';
import type { Toast as ToastType } from 'primereact/toast';

import 'primereact/resources/themes/saga-blue/theme.css';   
import 'primereact/resources/primereact.min.css';           
import 'primeicons/primeicons.css';                         

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  date_start: number;
  date_end: number;
}

interface LazyState {
  first: number;
  rows: number;
}

const App: React.FC = () => {
  const [apiData, setApiData] = useState<Artwork[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [loader, setLoader] = useState<boolean>(false);
  const [lazyState, setLazyState] = useState<LazyState>({
    first: 0,
    rows: 10,
  });

  const [selectedData, setSelectedData] = useState<Artwork[] | null>(null);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const toast = useRef<ToastType>(null);

  const fetchApiData = async () => {
    setLoader(true);
    const pageNumber = lazyState.first / lazyState.rows + 1;
    const limit = lazyState.rows;

    try {
      const url = `https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      setApiData(data.data);
      setTotalData(data.pagination.total);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Fetch Error',
        detail: error.message,
      });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, [lazyState]);

  const onPage = (event: DataTablePageEvent) => {
    setLazyState((prev) => ({ ...prev, first: event.first, rows: event.rows }));
  };

  const onSelectionChange = (e: DataTableSelectionChangeEvent<Artwork[]>) => {
    setSelectedData(e.value);
  };

  const onSelectAllChange = (e: DataTableSelectAllChangeEvent) => {
    setSelectAll(e.checked);
    if (e.checked) {
      setSelectedData([...apiData]);
    } else {
      setSelectedData([]);
    }
  };

  return (
    <div className="card">
      <Toast ref={toast} />

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
        <Column selectionMode="multiple" headerStyle={{ width: '2rem' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
};

export default App;
