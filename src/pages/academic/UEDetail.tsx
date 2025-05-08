import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAcademic } from '../../contexts/AcademicContext';
import { useForm } from 'react-hook-form';
import { BookOpen, PlusCircle, Edit2, Trash2, ChevronLeft, AlertTriangle, CheckCircle, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubjectFormInputs {
  name: string;
  coefficient: number;
}

interface GradeFormInputs {
  interrogation: number | '';
  devoir: number | '';
  rattrapage: number | '';
}

const UEDetail = () => {
  const { yearId, semesterId, ueId } = useParams<{ yearId: string, semesterId: string, ueId: string }>();
  const navigate = useNavigate();
  const { 
    getAcademicYear,
    getSemester,
    getUE,
    getUEWithCalculations,
    createSubject,
    updateSubject,
    deleteSubject,
    updateSubjectGrades,
    simulateMinimumGrades
  } = useAcademic();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingGradesId, setEditingGradesId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubjectFormInputs>();
  const { register: registerEdit, handleSubmit: handleEditSubmit, setValue: setEditValue } = useForm<SubjectFormInputs>();
  const { register: registerGrades, handleSubmit: handleGradesSubmit, setValue: setGradeValue, watch } = useForm<GradeFormInputs>();
  
  const year = yearId ? getAcademicYear(yearId) : undefined;
  const semester = semesterId ? getSemester(semesterId) : undefined;
  const ue = ueId ? getUE(ueId) : undefined;
  const ueWithCalculations = ueId ? getUEWithCalculations(ueId) : undefined;
  
  const simulationResult = ueId ? simulateMinimumGrades(ueId) : undefined;

  useEffect(() => {
    if (!ue || !semester || !year) {
      navigate('/academic-years');
      toast.error('UE, semestre ou année non trouvé');
    }
  }, [ue, semester, year, navigate]);

  if (!ue || !semester || !year || !ueWithCalculations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const onCreateSubmit = async (data: SubjectFormInputs) => {
    setIsLoading(true);
    try {
      await createSubject(ueId!, data.name, Number(data.coefficient));
      setIsCreating(false);
      reset();
      toast.success('Matière créée avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: SubjectFormInputs) => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      await updateSubject(editingId, data.name, Number(data.coefficient));
      setEditingId(null);
      toast.success('Matière mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const onGradesSubmit = async (data: GradeFormInputs) => {
    if (!editingGradesId) return;
    
    setIsLoading(true);
    try {
      const interrogation = data.interrogation === '' ? null : Number(data.interrogation);
      const devoir = data.devoir === '' ? null : Number(data.devoir);
      const rattrapage = data.rattrapage === '' ? null : Number(data.rattrapage);
      
      await updateSubjectGrades(editingGradesId, interrogation, devoir, rattrapage);
      setEditingGradesId(null);
      toast.success('Notes mises à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Toutes les données associées seront perdues.')) {
      setIsLoading(true);
      try {
        await deleteSubject(id);
        toast.success('Matière supprimée');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startEdit = (id: string, name: string, coefficient: number) => {
    setEditingId(id);
    setEditingGradesId(null);
    setEditValue('name', name);
    setEditValue('coefficient', coefficient);
  };

  const startEditGrades = (id: string, interrogation: number | null, devoir: number | null, rattrapage: number | null) => {
    setEditingGradesId(id);
    setEditingId(null);
    setGradeValue('interrogation', interrogation === null ? '' : interrogation);
    setGradeValue('devoir', devoir === null ? '' : devoir);
    setGradeValue('rattrapage', rattrapage === null ? '' : rattrapage);
  };

  const coefficientSum = ueWithCalculations.subjects.reduce((sum, subject) => sum + subject.coefficient, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link
          to={`/academic-years/${yearId}/semester/${semesterId}`}
          className="mr-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à {semester.title}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{ue.name}</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Résumé de l'UE</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Crédits</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {ue.credits}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Moyenne</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {ueWithCalculations.average !== null ? 
                  `${ueWithCalculations.average.toFixed(2)}/20` : 
                  'N/A'
                }
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1">
                {ueWithCalculations.isValid ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validée
                  </span>
                ) : ueWithCalculations.subjects.length === 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <AlignLeft className="h-3 w-3 mr-1" />
                    En attente
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Non validée
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {simulationResult && !simulationResult.isPossible && !ueWithCalculations.isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Simulation de validation</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{simulationResult.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {simulationResult && simulationResult.isPossible && Object.keys(simulationResult.minimumGrades).length > 0 && !ueWithCalculations.isValid && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Conseil de validation</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>{simulationResult.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Matières</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setEditingGradesId(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle matière
        </button>
      </div>
      
      {isCreating && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Nouvelle matière</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Créez une nouvelle matière avec un coefficient.</p>
            </div>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom de la matière
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      {...register('name', { 
                        required: 'Le nom est requis' 
                      })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="ex: Algèbre"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="coefficient" className="block text-sm font-medium text-gray-700">
                    Coefficient
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="coefficient"
                      min="1"
                      step="0.5"
                      {...register('coefficient', { 
                        required: 'Le coefficient est requis',
                        min: {
                          value: 0.5,
                          message: 'Le minimum est 0.5'
                        }
                      })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.coefficient && (
                      <p className="mt-1 text-sm text-red-600">{errors.coefficient.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {ueWithCalculations.subjects.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune matière</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer au moins deux matières pour cette UE.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une matière
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow sm:rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matière
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coefficient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interrogation (40%)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Devoir (60%)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moy. initiale
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rattrapage
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moy. finale
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ueWithCalculations.subjects.map(subject => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {editingId === subject.id ? (
                    <input
                      type="text"
                      {...registerEdit('name', { required: true })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className={`inline-flex items-center ${
                      subject.status === 'danger' ? 'text-red-600' :
                      subject.status === 'warning' ? 'text-yellow-600' :
                      'text-gray-900'
                    }`}>
                      {subject.status === 'danger' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {subject.status === 'warning' && <AlertTriangle className="h-4 w-4 mr-1" />}
                      {subject.name}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingId === subject.id ? (
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      {...registerEdit('coefficient', { required: true, min: 0.5 })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {subject.coefficient}
                    </span>
                  )}
                </td>
                {/* Grades */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingGradesId === subject.id ? (
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      {...registerGrades('interrogation')}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0-20"
                    />
                  ) : (
                    subject.interrogation !== null ? subject.interrogation.toFixed(2) : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingGradesId === subject.id ? (
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      {...registerGrades('devoir')}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0-20"
                    />
                  ) : (
                    subject.devoir !== null ? subject.devoir.toFixed(2) : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.initialAverage !== null ? (
                    <span className={
                      subject.initialAverage < 7 ? 'text-red-600 font-medium' : 'text-gray-500'
                    }>
                      {subject.initialAverage.toFixed(2)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingGradesId === subject.id ? (
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.25"
                      {...registerGrades('rattrapage')}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="0-20"
                    />
                  ) : (
                    subject.rattrapage !== null ? subject.rattrapage.toFixed(2) : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.finalAverage !== null ? (
                    <span className={subject.finalAverage < 7 ? 'text-red-600 font-medium' :
                      subject.finalAverage >= 10 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {subject.finalAverage.toFixed(2)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === subject.id ? (
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleEditSubmit(onEditSubmit)()}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : editingGradesId === subject.id ? (
                    <div className="flex space-x-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleGradesSubmit(onGradesSubmit)()}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGradesId(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-3 justify-end">
                      <button
                        onClick={() => startEditGrades(subject.id, subject.interrogation, subject.devoir, subject.rattrapage)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => startEdit(subject.id, subject.name, subject.coefficient)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total / Moyenne
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {coefficientSum}
              </td>
              <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {ueWithCalculations.average !== null ? (
                  <span className={ueWithCalculations.average < 10 ? 'text-red-600' : 'text-green-600'}>
                    {ueWithCalculations.average.toFixed(2)}
                  </span>
                ) : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {ueWithCalculations.isValid ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validée
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Non validée
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      )}
    </div>
  );
};

export default UEDetail;