export interface CalculationResult {
  data: any[]
  summary: {
    totalSavings: number
    totalDistanceSavings: number
    totalDurationSavings: number
    totalCO2Savings: number
    totalTripsSavings: number
  }
}

export interface FileUploadState {
  communityFile: File | null
  clinicFile: File | null
  charlieFile: File | null
  costsFile: File | null
}

export interface UploadProgress {
  uploading: boolean
  processing: boolean
  complete: boolean
} 