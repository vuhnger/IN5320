import React from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@dhis2/ui'

const dataQuery = {
    dataSets: {
        resource: 'dataSets/aLpVgfXiz0f',
        params: {
            fields: [
                'name',
                'id',
                'dataSetElements[dataElement[id, displayName]',
            ],
        },
    },
    dataValueSets: {
        resource: 'dataValueSets',
        params: {
            orgUnit: 'KiheEgvUZ0i',
            dataSet: 'aLpVgfXiz0f',
            period: '2020',
        },
    },
}

function mergeData(data) {
    if (!data?.dataSets?.dataSetElements?.length) {
        return []
    }

    return data.dataSets.dataSetElements.map(element => {
        const matchedValue =
            data?.dataValueSets?.dataValues?.find(
                value => value.dataElement === element.dataElement.id
            ) ?? {}

        return {
            displayName: element.dataElement.displayName,
            id: element.dataElement.id,
            value: matchedValue.value ?? 'No value',
        }
    })
}


export function Browse() {
    const { loading, error, data } = useDataQuery(dataQuery)
    if (error) {
        return <span>ERROR: {error.message}</span>
    }

    if (loading) {
        return <span>Loading...</span>
    }

    const dataElements = mergeData(data)

    if (!dataElements.length) {
        return <h1>No data elements found for this dataset.</h1>
    }

    return (
        <div>
            <h1>Browse</h1>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Data element</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Value (2020)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataElements.map(element => (
                        <TableRow key={element.id}>
                            <TableCell>{element.displayName}</TableCell>
                            <TableCell>{element.id}</TableCell>
                            <TableCell>{element.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
