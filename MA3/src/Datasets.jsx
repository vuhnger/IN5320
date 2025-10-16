import React, { useState } from 'react';
import { useDataQuery } from '@dhis2/app-runtime';
import { Menu, MenuItem } from '@dhis2/ui';
import { DatasetsTable } from './DataSetsTable.jsx';

// Keep the query definition outside the component so its identity stays stable between renders
const dataSetsQuery = {
  request0: {
    resource: '/dataSets',
    params: {
      fields: 'id,displayName,created,dataSetElements[dataElement[id,displayName,code]]',
      paging: 'false',
    },
  },
};

export function Datasets() {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const { loading, error, data } = useDataQuery(dataSetsQuery);

  if (error) {
    return <span>ERROR: {error.message}</span>;
  }

  if (loading) {
    return <span>Loading...</span>;
  }

  const datasets = data?.request0?.dataSets ?? [];

  if (!datasets.length) {
    return <h1>No Data Available :(</h1>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
      <div>
        <h1>Datasets</h1>
        <Menu>
          {datasets.map((dataset) => (
            <MenuItem
              key={dataset.id}
              label={dataset.displayName}
              onClick={() => setSelectedDataset(dataset)}
              selected={selectedDataset && selectedDataset.id === dataset.id}
            />
          ))}
        </Menu>
      </div>
      <div style={{ minWidth: '350px', flex: 1 }}>
        <DatasetsTable dataset={selectedDataset} />
      </div>
    </div>
  );
}
