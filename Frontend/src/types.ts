export interface Community {
  name: string;
  lat: number;
  lng: number;
}

export interface Clinic {
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  from: string;
  to: string;
  distance: number;
  duration: number;
  color: string;
}

export interface CalculationResult {
  totalSavings: number;
  totalDistance: number;
  totalTime: number;
  totalCO2: number;
  totalTrips: number;
  csvData: string;
  communities: Community[];
  clinics: Clinic[];
  routes: Route[];
} 