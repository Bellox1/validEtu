import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  AcademicYear, 
  Semester, 
  UE, 
  Subject, 
  AcademicYearWithCalculations,
  SemesterWithCalculations,
  UEWithCalculations,
  SubjectWithCalculations,
  SimulationResult
} from '../models/types';

interface AcademicContextType {
  academicYears: AcademicYear[];
  loading: boolean;
  // Academic Year
  createAcademicYear: (title: string) => Promise<AcademicYear>;
  updateAcademicYear: (id: string, title: string) => Promise<void>;
  deleteAcademicYear: (id: string) => Promise<void>;
  getAcademicYear: (id: string) => AcademicYear | undefined;
  getAcademicYearWithCalculations: (id: string) => AcademicYearWithCalculations | undefined;
  // Semester
  createSemester: (academicYearId: string, title: string) => Promise<Semester>;
  updateSemester: (id: string, title: string) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  getSemester: (id: string) => Semester | undefined;
  getSemesterWithCalculations: (id: string) => SemesterWithCalculations | undefined;
  // UE
  createUE: (semesterId: string, name: string, credits: number) => Promise<UE>;
  updateUE: (id: string, name: string, credits: number) => Promise<void>;
  deleteUE: (id: string) => Promise<void>;
  getUE: (id: string) => UE | undefined;
  getUEWithCalculations: (id: string) => UEWithCalculations | undefined;
  // Subject
  createSubject: (ueId: string, name: string, coefficient: number) => Promise<Subject>;
  updateSubject: (id: string, name: string, coefficient: number) => Promise<void>;
  updateSubjectGrades: (id: string, interrogation: number | null, devoir: number | null, rattrapage: number | null) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  getSubject: (id: string) => Subject | undefined;
  getSubjectWithCalculations: (id: string) => SubjectWithCalculations | undefined;
  // Simulations
  simulateMinimumGrades: (ueId: string) => SimulationResult;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}

interface AcademicProviderProps {
  children: ReactNode;
}

export function AcademicProvider({ children }: AcademicProviderProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load data from localStorage on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      const storedYears = localStorage.getItem(`validetu_years_${currentUser.id}`);
      if (storedYears) {
        setAcademicYears(JSON.parse(storedYears));
      }
    } else {
      setAcademicYears([]);
    }
    setLoading(false);
  }, [currentUser]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (currentUser && !loading) {
      localStorage.setItem(`validetu_years_${currentUser.id}`, JSON.stringify(academicYears));
    }
  }, [academicYears, currentUser, loading]);

  // Helper function to calculate subject average
  const calculateSubjectAverage = (subject: Subject): number | null => {
    if (subject.interrogation === null || subject.devoir === null) {
      return null;
    }
    return subject.interrogation * 0.4 + subject.devoir * 0.6;
  };

  // Helper function to get subject final average (with retake)
  const getSubjectFinalAverage = (subject: Subject): number | null => {
    const initialAverage = calculateSubjectAverage(subject);
    
    if (initialAverage === null) {
      return null;
    }
    
    // If initial average < 7, consider retake
    if (initialAverage < 7) {
      // If retake exists, return the better of the two
      if (subject.rattrapage !== null) {
        return Math.max(initialAverage, subject.rattrapage);
      }
      // Else return initial average
      return initialAverage;
    }
    
    // If initial average >= 7, no retake needed
    return initialAverage;
  };

  // Helper function to check if subject is validated
  const isSubjectValidated = (subject: Subject): boolean => {
    const finalAverage = getSubjectFinalAverage(subject);
    return finalAverage !== null && finalAverage >= 7;
  };

  // Helper function to calculate UE average
  const calculateUEAverage = (ue: UE): number | null => {
    if (!ue.subjects.length) {
      return null;
    }
    
    let totalWeightedAverage = 0;
    let totalCoefficients = 0;
    let hasIncompleteSubject = false;
    
    for (const subject of ue.subjects) {
      const finalAverage = getSubjectFinalAverage(subject);
      if (finalAverage === null) {
        hasIncompleteSubject = true;
        continue;
      }
      totalWeightedAverage += finalAverage * subject.coefficient;
      totalCoefficients += subject.coefficient;
    }
    
    if (totalCoefficients === 0 || hasIncompleteSubject) {
      return null;
    }
    
    return totalWeightedAverage / totalCoefficients;
  };

  // Helper function to check if UE is validated
  const isUEValidated = (ue: UE): boolean => {
    // All subjects must have finalAverage >= 7
    const allSubjectsValidated = ue.subjects.length > 0 && 
      ue.subjects.every(subject => isSubjectValidated(subject));
    
    // UE average must be >= 10
    const ueAverage = calculateUEAverage(ue);
    const hasRequiredAverage = ueAverage !== null && ueAverage >= 10;
    
    return allSubjectsValidated && hasRequiredAverage;
  };

  // Helper function to calculate semester average
  const calculateSemesterAverage = (semester: Semester): number | null => {
    if (!semester.ues.length) {
      return null;
    }
    
    let totalWeightedAverage = 0;
    let totalCredits = 0;
    let hasIncompleteUE = false;
    
    for (const ue of semester.ues) {
      const ueAverage = calculateUEAverage(ue);
      if (ueAverage === null) {
        hasIncompleteUE = true;
        continue;
      }
      totalWeightedAverage += ueAverage * ue.credits;
      totalCredits += ue.credits;
    }
    
    if (totalCredits === 0 || hasIncompleteUE) {
      return null;
    }
    
    return totalWeightedAverage / totalCredits;
  };

  // Helper function to calculate semester validated credits
  const calculateSemesterValidatedCredits = (semester: Semester): number => {
    return semester.ues
      .filter(ue => isUEValidated(ue))
      .reduce((sum, ue) => sum + ue.credits, 0);
  };

  // Academic Year CRUD operations
  const createAcademicYear = async (title: string): Promise<AcademicYear> => {
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }
    
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newYear: AcademicYear = {
        id: Date.now().toString(),
        title,
        userId: currentUser.id,
        semesters: []
      };
      
      setAcademicYears(prev => [...prev, newYear]);
      return newYear;
    } finally {
      setLoading(false);
    }
  };

  const updateAcademicYear = async (id: string, title: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => 
          year.id === id ? { ...year, title } : year
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAcademicYear = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => prev.filter(year => year.id !== id));
    } finally {
      setLoading(false);
    }
  };

  const getAcademicYear = (id: string): AcademicYear | undefined => {
    return academicYears.find(year => year.id === id);
  };

  const getAcademicYearWithCalculations = (id: string): AcademicYearWithCalculations | undefined => {
    const year = getAcademicYear(id);
    if (!year) return undefined;
    
    const semestersWithCalculations = year.semesters.map(semester => {
      const validatedCredits = calculateSemesterValidatedCredits(semester);
      return {
        ...semester,
        average: calculateSemesterAverage(semester),
        totalCredits: semester.ues.reduce((sum, ue) => sum + ue.credits, 0),
        validatedCredits,
        ues: semester.ues.map(ue => {
          const average = calculateUEAverage(ue);
          const isValid = isUEValidated(ue);
          return {
            ...ue,
            average,
            isValid,
            subjects: ue.subjects.map(subject => {
              const initialAverage = calculateSubjectAverage(subject);
              const finalAverage = getSubjectFinalAverage(subject);
              let status: 'success' | 'warning' | 'danger' = 'success';
              
              if (finalAverage === null) {
                status = 'warning';
              } else if (finalAverage < 7) {
                status = 'danger';
              } else if (initialAverage !== null && initialAverage < 7) {
                status = 'warning';
              }
              
              return {
                ...subject,
                initialAverage,
                finalAverage,
                status
              };
            })
          };
        })
      };
    });
    
    const totalCredits = 60; // 2 semesters of 30 credits each
    const validatedCredits = semestersWithCalculations.reduce(
      (sum, semester) => sum + semester.validatedCredits, 0
    );
    
    return {
      ...year,
      totalCredits,
      validatedCredits,
      canProgress: validatedCredits >= 48, // 48/60 credits required to pass
      semesters: semestersWithCalculations
    };
  };

  // Semester CRUD operations
  const createSemester = async (academicYearId: string, title: string): Promise<Semester> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSemester: Semester = {
        id: Date.now().toString(),
        title,
        academicYearId,
        ues: []
      };
      
      setAcademicYears(prev => 
        prev.map(year => 
          year.id === academicYearId 
            ? { ...year, semesters: [...year.semesters, newSemester] } 
            : year
        )
      );
      
      return newSemester;
    } finally {
      setLoading(false);
    }
  };

  const updateSemester = async (id: string, title: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => 
            semester.id === id ? { ...semester, title } : semester
          )
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSemester = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.filter(semester => semester.id !== id)
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const getSemester = (id: string): Semester | undefined => {
    for (const year of academicYears) {
      const semester = year.semesters.find(s => s.id === id);
      if (semester) return semester;
    }
    return undefined;
  };

  const getSemesterWithCalculations = (id: string): SemesterWithCalculations | undefined => {
    const semester = getSemester(id);
    if (!semester) return undefined;
    
    const uesWithCalculations = semester.ues.map(ue => {
      const average = calculateUEAverage(ue);
      const isValid = isUEValidated(ue);
      return {
        ...ue,
        average,
        isValid,
        subjects: ue.subjects.map(subject => {
          const initialAverage = calculateSubjectAverage(subject);
          const finalAverage = getSubjectFinalAverage(subject);
          let status: 'success' | 'warning' | 'danger' = 'success';
          
          if (finalAverage === null) {
            status = 'warning';
          } else if (finalAverage < 7) {
            status = 'danger';
          } else if (initialAverage !== null && initialAverage < 7) {
            status = 'warning';
          }
          
          return {
            ...subject,
            initialAverage,
            finalAverage,
            status
          };
        })
      };
    });
    
    const totalCredits = uesWithCalculations.reduce((sum, ue) => sum + ue.credits, 0);
    const validatedCredits = uesWithCalculations
      .filter(ue => ue.isValid)
      .reduce((sum, ue) => sum + ue.credits, 0);
    
    return {
      ...semester,
      average: calculateSemesterAverage(semester),
      totalCredits,
      validatedCredits,
      ues: uesWithCalculations
    };
  };

  // UE CRUD operations
  const createUE = async (semesterId: string, name: string, credits: number): Promise<UE> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUE: UE = {
        id: Date.now().toString(),
        name,
        credits,
        semesterId,
        subjects: []
      };
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => 
            semester.id === semesterId 
              ? { ...semester, ues: [...semester.ues, newUE] } 
              : semester
          )
        }))
      );
      
      return newUE;
    } finally {
      setLoading(false);
    }
  };

  const updateUE = async (id: string, name: string, credits: number): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.map(ue => 
              ue.id === id ? { ...ue, name, credits } : ue
            )
          }))
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteUE = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.filter(ue => ue.id !== id)
          }))
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const getUE = (id: string): UE | undefined => {
    for (const year of academicYears) {
      for (const semester of year.semesters) {
        const ue = semester.ues.find(u => u.id === id);
        if (ue) return ue;
      }
    }
    return undefined;
  };

  const getUEWithCalculations = (id: string): UEWithCalculations | undefined => {
    const ue = getUE(id);
    if (!ue) return undefined;
    
    return {
      ...ue,
      average: calculateUEAverage(ue),
      isValid: isUEValidated(ue),
      subjects: ue.subjects.map(subject => {
        const initialAverage = calculateSubjectAverage(subject);
        const finalAverage = getSubjectFinalAverage(subject);
        let status: 'success' | 'warning' | 'danger' = 'success';
        
        if (finalAverage === null) {
          status = 'warning';
        } else if (finalAverage < 7) {
          status = 'danger';
        } else if (initialAverage !== null && initialAverage < 7) {
          status = 'warning';
        }
        
        return {
          ...subject,
          initialAverage,
          finalAverage,
          status
        };
      })
    };
  };

  // Subject CRUD operations
  const createSubject = async (ueId: string, name: string, coefficient: number): Promise<Subject> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        coefficient,
        ueId,
        interrogation: null,
        devoir: null,
        rattrapage: null
      };
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.map(ue => 
              ue.id === ueId 
                ? { ...ue, subjects: [...ue.subjects, newSubject] } 
                : ue
            )
          }))
        }))
      );
      
      return newSubject;
    } finally {
      setLoading(false);
    }
  };

  const updateSubject = async (id: string, name: string, coefficient: number): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.map(ue => ({
              ...ue,
              subjects: ue.subjects.map(subject => 
                subject.id === id ? { ...subject, name, coefficient } : subject
              )
            }))
          }))
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectGrades = async (
    id: string, 
    interrogation: number | null, 
    devoir: number | null, 
    rattrapage: number | null
  ): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.map(ue => ({
              ...ue,
              subjects: ue.subjects.map(subject => 
                subject.id === id 
                  ? { ...subject, interrogation, devoir, rattrapage } 
                  : subject
              )
            }))
          }))
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteSubject = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAcademicYears(prev => 
        prev.map(year => ({
          ...year,
          semesters: year.semesters.map(semester => ({
            ...semester,
            ues: semester.ues.map(ue => ({
              ...ue,
              subjects: ue.subjects.filter(subject => subject.id !== id)
            }))
          }))
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const getSubject = (id: string): Subject | undefined => {
    for (const year of academicYears) {
      for (const semester of year.semesters) {
        for (const ue of semester.ues) {
          const subject = ue.subjects.find(s => s.id === id);
          if (subject) return subject;
        }
      }
    }
    return undefined;
  };

  const getSubjectWithCalculations = (id: string): SubjectWithCalculations | undefined => {
    const subject = getSubject(id);
    if (!subject) return undefined;
    
    const initialAverage = calculateSubjectAverage(subject);
    const finalAverage = getSubjectFinalAverage(subject);
    let status: 'success' | 'warning' | 'danger' = 'success';
    
    if (finalAverage === null) {
      status = 'warning';
    } else if (finalAverage < 7) {
      status = 'danger';
    } else if (initialAverage !== null && initialAverage < 7) {
      status = 'warning';
    }
    
    return {
      ...subject,
      initialAverage,
      finalAverage,
      status
    };
  };

  // Simulation function
  const simulateMinimumGrades = (ueId: string): SimulationResult => {
    const ue = getUE(ueId);
    if (!ue) {
      return {
        minimumGrades: {},
        isPossible: false,
        message: "UE non trouvée"
      };
    }
    
    // Get subjects that need retake (final average < 7)
    const subjectsNeedingRetake = ue.subjects.filter(subject => {
      const finalAverage = getSubjectFinalAverage(subject);
      return finalAverage === null || finalAverage < 7;
    });
    
    // If no subjects need retake but UE average < 10
    if (subjectsNeedingRetake.length === 0) {
      const ueAverage = calculateUEAverage(ue);
      if (ueAverage !== null && ueAverage < 10) {
        return {
          minimumGrades: {},
          isPossible: false,
          message: "Toutes les matières ont des moyennes ≥ 7 mais la moyenne de l'UE est < 10. Aucun rattrapage possible."
        };
      }
      
      return {
        minimumGrades: {},
        isPossible: true,
        message: "Cette UE est déjà validée ou ne nécessite pas de rattrapage."
      };
    }
    
    // Simple case: only one subject needs retake
    if (subjectsNeedingRetake.length === 1) {
      const subjectToRetake = subjectsNeedingRetake[0];
      const totalCoefficients = ue.subjects.reduce((sum, s) => sum + s.coefficient, 0);
      let totalPoints = 0;
      
      // Calculate points from other subjects
      for (const subject of ue.subjects) {
        if (subject.id !== subjectToRetake.id) {
          const finalAverage = getSubjectFinalAverage(subject);
          if (finalAverage !== null) {
            totalPoints += finalAverage * subject.coefficient;
          }
        }
      }
      
      // Calculate minimum points needed for UE to get average of 10
      const totalPointsNeeded = 10 * totalCoefficients;
      const pointsNeeded = totalPointsNeeded - totalPoints;
      const minimumGrade = pointsNeeded / subjectToRetake.coefficient;
      
      if (minimumGrade > 20) {
        return {
          minimumGrades: { [subjectToRetake.id]: 20 },
          isPossible: false,
          message: `Même avec une note maximale de 20 au rattrapage de ${subjectToRetake.name}, la moyenne de l'UE sera insuffisante.`
        };
      }
      
      return {
        minimumGrades: { [subjectToRetake.id]: Math.ceil(minimumGrade * 2) / 2 }, // Round up to nearest 0.5
        isPossible: true,
        message: `Obtenir au moins ${Math.ceil(minimumGrade * 2) / 2} au rattrapage de ${subjectToRetake.name} permettra de valider l'UE.`
      };
    }
    
    // Complex case: multiple subjects need retake
    // For simplicity, we'll suggest equal improvements for all subjects
    const totalCoefficients = ue.subjects.reduce((sum, s) => sum + s.coefficient, 0);
    let totalPoints = 0;
    let totalRetakeCoefficients = 0;
    
    // Calculate current points from all subjects
    for (const subject of ue.subjects) {
      const finalAverage = getSubjectFinalAverage(subject);
      if (finalAverage !== null && !subjectsNeedingRetake.some(s => s.id === subject.id)) {
        totalPoints += finalAverage * subject.coefficient;
      } else if (subjectsNeedingRetake.some(s => s.id === subject.id)) {
        totalRetakeCoefficients += subject.coefficient;
      }
    }
    
    // Calculate points needed from retake subjects
    const totalPointsNeeded = 10 * totalCoefficients;
    const pointsNeeded = totalPointsNeeded - totalPoints;
    const averageGradeNeeded = pointsNeeded / totalRetakeCoefficients;
    
    if (averageGradeNeeded > 20) {
      return {
        minimumGrades: subjectsNeedingRetake.reduce((obj, s) => ({ ...obj, [s.id]: 20 }), {}),
        isPossible: false,
        message: "Même avec des notes maximales aux rattrapages, la validation de l'UE est impossible."
      };
    }
    
    const minimumGrades = {};
    let message = "Pour valider l'UE, obtenir au moins:\n";
    
    subjectsNeedingRetake.forEach(subject => {
      const grade = Math.max(7, Math.ceil(averageGradeNeeded * 2) / 2); // Minimum 7, rounded up to nearest 0.5
      minimumGrades[subject.id] = grade;
      message += `- ${grade} au rattrapage de ${subject.name}\n`;
    });
    
    return {
      minimumGrades,
      isPossible: true,
      message
    };
  };

  const value = {
    academicYears,
    loading,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    getAcademicYear,
    getAcademicYearWithCalculations,
    createSemester,
    updateSemester,
    deleteSemester,
    getSemester,
    getSemesterWithCalculations,
    createUE,
    updateUE,
    deleteUE,
    getUE,
    getUEWithCalculations,
    createSubject,
    updateSubject,
    updateSubjectGrades,
    deleteSubject,
    getSubject,
    getSubjectWithCalculations,
    simulateMinimumGrades
  };

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>;
}