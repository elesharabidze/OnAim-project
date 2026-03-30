export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export interface TableColumn<T> {
  id: keyof T | string
  label: string
  sortable?: boolean
  width?: number | string
}

export interface ApiError {
  message: string
  statusCode?: number
}
