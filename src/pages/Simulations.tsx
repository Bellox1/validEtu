import { useState, useEffect } from 'react';
import { useAcademic } from '../contexts/AcademicContext';
import { AcademicYear, UE, Subject, UEWithCalculations } from '../models/types';
import { GraduationCap, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const Simulations = () => {
  const { academicYears, getAcademicYearWithCalculations, getUEWithCalculations } = useAcademic();
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedUEId, setSelectedUEId] = useState<string>('');
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});
  const [ueWithSimulation, setUeWithSimulation] = useState<UEWithCalculations | null>(null);
  const [simulationResults, setSimulationResults] = useState<{
    isValid: boolean;
    message: string;
    average: number | null;
  } | null>(null);

  // Get selected year details
  const selectedYear = selectedYearId 
    ? getAcademicYearWithCalculations(selectedYearId) 
    : undefined;

  // Get UEs for the selected year
  const availableUEs: UE[] = selectedYear 
    ? selectedYear.semesters.flatMap(s => s.ues) 
    : [];

  // Reset UE when year changes
  useEffect(() => {
    setSelectedUEId('');
    setSimulatedGrades({});
    setUeWithSimulation(null);
    setSimulationResults(null);
  }, [selectedYearId]);

  // Get UE details when selected
  useEffect(() => {
    if (selectedUEId) {
      const ue = getUEWithCalculations(selectedUEId);
      if (ue) {
        setUeWithSimulation(ue);
        // Initialize simulated grades with current values
        const initialGrades: Record<string, number> = {};
        ue.subjects.forEach(subject => {
          if (subject.finalAverage !== null) {
            initialGrades[subject.id] = subject.finalAverage;
          } else if (subject.initialAverage !== null) {
            initialGrades[subject.id] = subject.initialAverage;
          } else {
            initialGrades[subject.id] = 0;
          }
        });
        setSimulatedGrades(initialGrades);
      }
    } else {
      setUeWithSimulation(null);
      setSimulatedGrades({});
    }
    setSimulationResults(null);
  }, [selectedUEId, getUEWithCalculations]);

  const handleGradeChange = (subjectId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
      setSimulatedGrades(prev => ({
        ...prev,
        [subjectId]: numValue
      }));
    }
  };

  const runSimulation = () => {
    if (!ueWithSimulation) return;
    
    // Check if all subjects have grades
    const allSubjectsHaveGrades = ueWithSimulation.subjects.every(
      subject => simulatedGrades[subject.id] !== undefined
    );
    
    if (!allSubjectsHaveGrades) {
      setSimulationResults({
        isValid: false,
        message: "Veuillez attribuer une note à toutes les matières pour simuler la validation de l'UE.",
        average: null
      });
      return;
    }
    
    // Check if all subjects have grade >= 7
    const allSubjectsValid = ueWithSimulation.subjects.every(
      subject => simulatedGrades[subject.id] >= 7
    );
    
    if (!allSubjectsValid) {
      setSimulationResults({
        isValid: false,
        message: "L'UE ne peut pas être validée car une ou plusieurs matières ont une moyenne inférieure à 7.",
        average: null
      });
      return;
    }
    
    // Calculate UE average with simulated grades
    let totalWeightedGrade = 0;
    let totalCoefficients = 0;
    
    ueWithSimulation.subjects.forEach(subject => {
      totalWeightedGrade += simulatedGrades[subject.id] * subject.coefficient;
      totalCoefficients += subject.coefficient;
    });
    
    const simulatedAverage = totalWeightedGrade / totalCoefficients;
    
    if (simulatedAverage >= 10) {
      setSimulationResults({
        isValid: true,
        message: `L'UE est validée avec ces notes. Moyenne simulée: ${simulatedAverage.toFixed(2)}/20`,
        average: simulatedAverage
      });
    } else {
      setSimulationResults({
        isValid: false,
        message: `L'UE n'est pas validée avec ces notes. Il faut une moyenne d'au moins 10/20, mais la moyenne simulée est ${simulatedAverage.toFixed(2)}/20.`,
        average: simulatedAverage
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Simulations</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <GraduationCap size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Simulateur de validation d'UE</h3>
              <p className="text-sm text-gray-500">
                Simulez des notes pour vérifier si une UE serait validée
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">
                  Sélectionnez une année
                </label>
                <select
                  id="year-select"
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Choisir une année</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="ue-select" className="block text-sm font-medium text-gray-700">
                  Sélectionnez une UE
                </label>
                <select
                  id="ue-select"
                  value={selectedUEId}
                  onChange={(e) => setSelectedUEId(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={!selectedYearId || availableUEs.length === 0}
                >
                  <option value="">Choisir une UE</option>
                  {availableUEs.map(ue => (
                    <option key={ue.id} value={ue.id}>{ue.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {ueWithSimulation && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Simulez les notes pour {ueWithSimulation.name}</h4>
                
                <div className="overflow-hidden bg-white border border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matière
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Coefficient
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note actuelle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Note simulée
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ueWithSimulation.subjects.map(subject => (
                        <tr key={subject.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {subject.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subject.coefficient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subject.finalAverage !== null ? 
                              subject.finalAverage.toFixed(2) : 
                              subject.initialAverage !== null ?
                                subject.initialAverage.toFixed(2) :
                                'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.25"
                              value={simulatedGrades[subject.id] || ''}
                              onChange={(e) => handleGradeChange(subject.id, e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="0-20"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={runSimulation}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simuler la validation
                  </button>
                </div>
                
                {simulationResults && (
                  <div className={`mt-4 p-4 rounded-md ${
                    simulationResults.isValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {simulationResults.isValid ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          simulationResults.isValid ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          Résultat de la simulation
                        </h3>
                        <div className={`mt-2 text-sm ${
                          simulationResults.isValid ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          <p>{simulationResults.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!selectedYearId && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">Veuillez sélectionner une année académique pour commencer.</p>
              </div>
            )}
            
            {selectedYearId && availableUEs.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">Aucune UE trouvée pour cette année académique.</p>
              </div>
            )}
            
            {selectedYearId && availableUEs.length > 0 && !selectedUEId && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">Veuillez sélectionner une UE pour simuler sa validation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ArrowRight size={20} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rappel des règles de validation</h3>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="prose prose-blue max-w-none">
            <h4>Pour valider une UE :</h4>
            <ul>
              <li>Toutes les matières doivent avoir une moyenne finale &gt;= 7</li>
              <li>La moyenne pondérée des matières (selon les coefficients) doit être &gt;= 10</li>
            </ul>
            
            <h4>Calcul de la moyenne d'une matière :</h4>
            <p>Moyenne = (Interrogation × 0.4) + (Devoir × 0.6)</p>
            
            <h4>Gestion du rattrapage :</h4>
            <ul>
              <li>Si moyenne initiale &lt; 7 → rattrapage obligatoire</li>
              <li>La moyenne finale est la meilleure des deux valeurs entre la moyenne initiale et la note de rattrapage</li>
            </ul>
            
            <h4>Passage en classe supérieure :</h4>
            <p>À la fin de l'année (60 crédits), l'étudiant passe en classe supérieure si total_crédits_validés &gt;= 48</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulations;