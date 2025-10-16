import React, { useState } from 'react'
import {
  InputField,
  Button,
  NoticeBox,
  SingleSelect,
  SingleSelectOption,
} from '@dhis2/ui'
import { useDataMutation, useDataQuery } from '@dhis2/app-runtime'

const allowedValuesQuery = {
  dataSet: {
    resource: 'dataSets/aLpVgfXiz0f',
    params: {
      fields:
        'id,displayName,dataSetElements[dataElement[id,displayName]],organisationUnits[id,displayName]',
    },
  },
}

export function Insert() {
  const [values, setValues] = useState({
    dataElement: '',
    orgUnit: '',
    period: '',
    value: '',
  })
  const [validationErrors, setValidationErrors] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  const {
    data: allowedData,
    error: allowedError,
    loading: allowedLoading,
  } = useDataQuery(allowedValuesQuery)

  const dataElements =
    (allowedData?.dataSet?.dataSetElements ?? [])
      .map((element) => element.dataElement)
      .filter(Boolean) ?? []

  const organisationUnits = allowedData?.dataSet?.organisationUnits ?? []

  const allowedDataElementIds = dataElements.map((element) => element.id)
  const allowedOrgUnitIds = organisationUnits.map((orgUnit) => orgUnit.id)

  const [mutate, { loading }] = useDataMutation({
    resource: 'dataValueSets',
    type: 'create',
    data: payload => payload,
  })

  function handleChange(name, value) {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  function validate() {
    const errors = []

    if (!values.dataElement) {
      errors.push('Select a data element.')
    }

    if (!values.orgUnit) {
      errors.push('Select an organisation unit.')
    }

    if (!values.period) {
      errors.push('Provide a period in YYYY format.')
    } else if (!/^\d{4}$/.test(values.period)) {
      errors.push('Period must be a four digit year, e.g. 2020.')
    }

    if (values.value === '') {
      errors.push('Enter a numeric value.')
    } else {
      const numericValue = Number(values.value)
      if (!Number.isFinite(numericValue)) {
        errors.push('Value must be a number.')
      } else if (numericValue < 0) {
        errors.push('Value cannot be negative.')
      }
    }

    if (
      values.dataElement &&
      allowedDataElementIds.length &&
      !allowedDataElementIds.includes(values.dataElement)
    ) {
      errors.push('Selected data element is not valid for this dataset.')
    }

    if (
      values.orgUnit &&
      allowedOrgUnitIds.length &&
      !allowedOrgUnitIds.includes(values.orgUnit)
    ) {
      errors.push('Selected organisation unit is not part of this dataset.')
    }

    return errors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setValidationErrors([])
    setSubmitError('')
    setSubmitSuccess('')

    const errors = validate()

    if (errors.length) {
      setValidationErrors(errors)
      return
    }

    try {
      const result = await mutate({
        dataValues: [
          {
            dataElement: values.dataElement,
            period: values.period,
            orgUnit: values.orgUnit,
            value: values.value,
          },
        ],
      })

      const importSummary =
        result?.response?.importSummaries?.[0] ?? result?.response ?? result
      const status =
        importSummary?.status ?? result?.status ?? 'SUCCESS'
      const importedCount =
        importSummary?.importCount?.imported ??
        result?.response?.importCount?.imported ??
        0

      if (status === 'SUCCESS' || importedCount > 0) {
        setSubmitSuccess(
          `Data value submitted successfully. Imported ${importedCount} value(s).`
        )
      } else {
        setSubmitError(
          `Request completed but returned status "${status}". Please verify your input.`
        )
      }

      setValues({
        dataElement: '',
        orgUnit: '',
        period: '',
        value: '',
      })
    } catch (error) {
      setSubmitError(error?.message ?? 'Something went wrong while submitting the data value.')
    }
  }

  return (
    <div>
      <h1>Insert</h1>
      <p>Submit a data value to the `dataValueSets` endpoint.</p>
      {allowedError && (
        <div style={{ marginBottom: '1rem' }}>
          <NoticeBox title="Metadata unavailable" error>
            Failed to load dataset metadata. You can still submit values manually if you
            know the correct identifiers.
          </NoticeBox>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: 420, display: 'grid', gap: '1rem' }}>
        <SingleSelect
          label="Data Element"
          placeholder="Pick a data element"
          selected={values.dataElement || undefined}
          onChange={({ selected }) => handleChange('dataElement', selected ?? '')}
          filterable
          disabled={loading || allowedLoading || !dataElements.length}
          noMatchText="No data elements match the filter"
        >
          {dataElements.map((element) => (
            <SingleSelectOption
              key={element.id}
              label={element.displayName}
              value={element.id}
            />
          ))}
        </SingleSelect>
        <SingleSelect
          label="Organisation Unit"
          placeholder="Pick an organisation unit"
          selected={values.orgUnit || undefined}
          onChange={({ selected }) => handleChange('orgUnit', selected ?? '')}
          disabled={loading || allowedLoading || !organisationUnits.length}
          filterable
          noMatchText="No organisation units match the filter"
        >
          {organisationUnits.map((orgUnit) => (
            <SingleSelectOption
              key={orgUnit.id}
              label={orgUnit.displayName}
              value={orgUnit.id}
            />
          ))}
        </SingleSelect>
        <InputField
          label="Period"
          name="period"
          required
          value={values.period}
          onChange={({ value }) => handleChange('period', value)}
          helpText="Use DHIS2 yearly period format, e.g. 2020"
          disabled={loading}
        />
        <InputField
          label="Value"
          name="value"
          required
          value={values.value}
          onChange={({ value }) => handleChange('value', value)}
          helpText="Enter a non-negative numeric value"
          disabled={loading}
        />
        <Button primary type="submit" disabled={loading || allowedLoading}>
          {loading ? 'Submitting…' : 'Submit'}
        </Button>
        {allowedLoading && (
          <span style={{ fontSize: '0.85rem' }}>
            Loading allowed data elements and organisation units…
          </span>
        )}
      </form>

      {!!validationErrors.length && (
        <div style={{ marginTop: '1rem' }}>
          <NoticeBox title="Check the form" warning>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </NoticeBox>
        </div>
      )}

      {submitError && (
        <div style={{ marginTop: '1rem' }}>
          <NoticeBox title="Submission failed" error>
            {submitError}
          </NoticeBox>
        </div>
      )}

      {submitSuccess && (
        <div style={{ marginTop: '1rem' }}>
          <NoticeBox title="Success" success>
            {submitSuccess}
          </NoticeBox>
        </div>
      )}
    </div>
  )
}
