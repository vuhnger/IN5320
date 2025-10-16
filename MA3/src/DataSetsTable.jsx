import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  NoticeBox,
} from '@dhis2/ui';

export function DatasetsTable({ dataset }) {
  if (!dataset) {
    return <h2>Select a dataset to see details</h2>;
  }

  const dataElements = (dataset.dataSetElements ?? [])
    .map((element) => element.dataElement)
    .filter(Boolean);

  return (
    <div>
      <h2>{dataset.displayName}</h2>
      <p>
        <strong>ID:</strong> {dataset.id}
      </p>
      <p>
        <strong>Created:</strong> {dataset.created}
      </p>

      {dataElements.length ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data element</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Code</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataElements.map((element) => (
              <TableRow key={element.id}>
                <TableCell>{element.displayName}</TableCell>
                <TableCell>{element.id}</TableCell>
                <TableCell>{element.code ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <NoticeBox title="No data elements" warning>
          This dataset does not expose any dataSetElements with the current
          fields configuration.
        </NoticeBox>
      )}
    </div>
  );
}
