export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface AcademicYear {
  id: string;
  title: string;
  userId: string;
  semesters: Semester[];
}

export interface Semester {
  id: string;
  title: string;
  academicYearId: string;
  ues: UE[];
}

export interface UE {
  id: string;
  name: string;
  credits: number;
  semesterId: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  coefficient: number;
  ueId: string;
  interrogation: number | null;
  devoir: number | null;
  rattrapage: number | null;
}

export interface ValidationStatus {
  isValid: boolean;
  message: string;
  needsRetake: boolean;
  minimumRetakeGrade?: number;
}

export interface SubjectWithCalculations extends Subject {
  initialAverage: number | null;
  finalAverage: number | null;
  status: 'success' | 'warning' | 'danger';
}

export interface UEWithCalculations extends UE {
  average: number | null;
  isValid: boolean;
  subjects: SubjectWithCalculations[];
}

export interface SemesterWithCalculations extends Semester {
  average: number | null;
  totalCredits: number;
  validatedCredits: number;
  ues: UEWithCalculations[];
}

export interface AcademicYearWithCalculations extends AcademicYear {
  totalCredits: number;
  validatedCredits: number;
  canProgress: boolean;
  semesters: SemesterWithCalculations[];
}

export interface SimulationResult {
  minimumGrades: Record<string, number>;
  isPossible: boolean;
  message: string;
}