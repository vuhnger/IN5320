// Data Query with dynamic ID.
const dataQuery = {
    dataSets: {
        resource: 'dataSets',
        id: ({ id }) => id,
        params: {
            fields: ['dataSetElements[dataElement[id, displayName,created]'],
            paging: false,
        },
    },
}

// A component that takes a dataSet ID as a prop.
export function DatasetsTable({ id }) {
    /* 
    A useDataQuery where we pass the id as a variable. Note that we also save the refetch
    which allows us to run the query again at a later point.
    */
    const { loading, error, data, refetch } = useDataQuery(dataQuery, {
        variables: {
            id: id,
        },
    })

    /* 
    You can use useEffect to check if props change (and not just state).
    We check if the ID prop has changed from the last run and then re-run the 
    dataQuery with the new id to get fresh data when a user clicks on a new ID.
    */
    useEffect(() => {
        refetch({ id: id })
    }, [id])

    if (data) {
        return {
            /*Table*/
        }
    }
}