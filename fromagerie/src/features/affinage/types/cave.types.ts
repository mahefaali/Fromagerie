export interface RangeeApi {
  id: number;
  numero: number;
  ordre: number;
  capacite: number;
  capaciteOccupee: number;
  capaciteDisponible: number;
}

export interface EtagereApi {
  id: number;
  numero: number;
  ordre: number;
  rangees: RangeeApi[];
}

export interface CaveApiResponse {
  id: number;
  nom: string;
  description: string | null;
  temperature: number;
  humidite: number;
  ageMinJours: number;
  ageMaxJours: number;
  active: boolean;
  capaciteTotale: number;
  capaciteOccupee: number;
  capaciteDisponible: number;
  etageres: EtagereApi[];
}

export interface CaveOccupation {
  placementId: number;
  etagereNumero: number;
  rangeeNumero: number;
  positionDebut: number;
  positionFin: number;
  numeroLot: string;
}

export interface CaveApiRequest {
  nom: string;
  description: string;
  temperature: number;
  humidite: number;
  ageMinJours: number;
  ageMaxJours: number;
  active: boolean;
  etageres: Array<{
    numero: number;
    ordre: number;
    rangees: Array<{ numero: number; ordre: number; capacite: number }>;
  }>;
}
