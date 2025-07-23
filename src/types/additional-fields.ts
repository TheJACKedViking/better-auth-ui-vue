export type FieldType = "string" | "number" | "boolean"

export interface AdditionalField {
    description?: any
    instructions?: any
    label: any
    placeholder?: string
    required?: boolean
    type: FieldType
    validate?: (value: string) => Promise<boolean>
}

export interface AdditionalFields {
    [key: string]: AdditionalField
}