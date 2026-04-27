export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox'

export interface FormField {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
  placeholder?: string
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  fields: FormField[]
}

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  generic_request: {
    id: 'generic_request',
    title: 'Request',
    fields: [
      { key: 'response', label: 'Your Response', type: 'textarea', required: true, placeholder: 'Enter your response...' },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Anything else to add?' },
    ],
  },
  approval: {
    id: 'approval',
    title: 'Approval Required',
    fields: [
      { key: 'decision', label: 'Decision', type: 'select', required: true, options: ['Approved', 'Approved with conditions', 'Rejected', 'Need more information'] },
      { key: 'conditions', label: 'Conditions / Notes', type: 'textarea', placeholder: 'Any conditions or clarifications...' },
    ],
  },
  rfi: {
    id: 'rfi',
    title: 'RFI Response',
    fields: [
      { key: 'response', label: 'Technical Response', type: 'textarea', required: true, placeholder: 'Provide your technical response...' },
      { key: 'drawingRef', label: 'Drawing / Spec Reference', type: 'text', placeholder: 'Sheet A-201, Spec 03300...' },
      { key: 'revisedDate', label: 'Revised Completion Date', type: 'date' },
    ],
  },
}
