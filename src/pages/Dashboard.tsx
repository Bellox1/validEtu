import { useState, useEffect } from 'react';
import { useAcademic } from '../contexts/AcademicContext';
import { AcademicYearWithCalculations } from '../models/types';
import { Link } from 'react-router-dom';
import { BookOpen, AlertTriangle, CheckCircle, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const { academicYears, getAcademicYearWithCalculations } = useAcademic();
  const [yearsWithCalculations, setYearsWithCalculations] = useState<AcademicYearWithCalculations[]>([]);

  useEffect(() => {
    if (academicYears.length > 0) {
      const yearsWithCalc = academicYears
        .map(year => getAcademicYearWithCalculations(year.id))
        .filter((year): year is AcademicYearWithCalculations => year !== undefined);
      setYearsWithCalculations(yearsWithCalc);
    }
  }, [academicYears, getAcademicYearWithCalculations]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <Link
          to="/academic-years"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Gérer mes années
        </Link>
        
      </div>

      {yearsWithCalculations.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune année académique</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre première année académique pour suivre vos résultats.
            </p>
            <div className="mt-6">
              <Link
                to="/academic-years"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une année
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {yearsWithCalculations.map(year => (
            <div key={year.id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{year.title}</h3>
                {year.canProgress ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validée
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    En cours
                  </span>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Crédits validés</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {year.validatedCredits} / {year.totalCredits}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Progression</dt>
                    <dd className="mt-1">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                          <div
                            style={{ width: `${(year.validatedCredits / year.totalCredits) * 100}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${year.canProgress ? 'bg-green-500' : 'bg-blue-500'}`}
                          ></div>
                        </div>
                      </div>
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2 mt-2">
                    <div className="space-y-2">
                      {year.semesters.map(semester => (
                        <div key={semester.id} className="p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700">{semester.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Crédits: {semester.validatedCredits} / {semester.totalCredits}
                            {semester.average !== null && (
                              <span className="ml-2">
                                Moyenne: {semester.average.toFixed(2)}/20
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 mt-4">
                    <Link
                      to={`/academic-years/${year.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Voir les détails
                    </Link>
                  </div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      )}

      {yearsWithCalculations.length > 0 && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Matières en rattrapage</h3>
            <p className="mt-1 text-sm text-gray-500">
              Liste des matières qui nécessitent un rattrapage
            </p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {yearsWithCalculations.some(year => 
                year.semesters.some(semester => 
                  semester.ues.some(ue => 
                    ue.subjects.some(subject => 
                      subject.initialAverage !== null && subject.initialAverage < 7
                    )
                  )
                )
              ) ? (
                yearsWithCalculations.map(year => 
                  year.semesters.map(semester => 
                    semester.ues.map(ue => 
                      ue.subjects.filter(subject => 
                        subject.initialAverage !== null && subject.initialAverage < 7
                      ).map(subject => (
                        <li key={subject.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                              <p className="text-xs text-gray-500">
                                {year.title} &bull; {semester.title} &bull; {ue.name}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Moyenne: {subject.initialAverage !== null ? subject.initialAverage.toFixed(2) : 'N/A'}/20
                              </span>
                              <Link
                                to={`/academic-years/${year.id}/semester/${semester.id}/ue/${ue.id}`}
                                className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Gérer
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))
                    )
                  )
                ).flat().flat().flat()
              ) : (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  Aucune matière en rattrapage
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;