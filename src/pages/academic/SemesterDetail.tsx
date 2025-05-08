import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAcademic } from '../../contexts/AcademicContext';
import { useForm } from 'react-hook-form';
import { BookOpen, PlusCircle, Edit2, Trash2, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UEFormInputs {
  name: string;
  credits: number;
}

const SemesterDetail = () => {
  const { yearId, semesterId } = useParams<{ yearId: string, semesterId: string }>();
  const navigate = useNavigate();
  const { 
    getAcademicYear,
    getSemester,
    getSemesterWithCalculations,
    createUE,
    updateUE,
    deleteUE
  } = useAcademic();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UEFormInputs>();
  const { register: registerEdit, handleSubmit: handleEditSubmit, setValue } = useForm<UEFormInputs>();

  const year = yearId ? getAcademicYear(yearId) : undefined;
  const semester = semesterId ? getSemester(semesterId) : undefined;
  const semesterWithCalculations = semesterId ? getSemesterWithCalculations(semesterId) : undefined;

  useEffect(() => {
    if (!semester || !year) {
      navigate('/academic-years');
      toast.error('Semestre ou année non trouvé');
    }
  }, [semester, year, navigate]);

  if (!semester || !year || !semesterWithCalculations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const onCreateSubmit = async (data: UEFormInputs) => {
    setIsLoading(true);
    try {
      // Check if total credits with new UE would exceed 30
      const currentTotalCredits = semesterWithCalculations.ues.reduce((sum, ue) => sum + ue.credits, 0);
      const newTotalCredits = currentTotalCredits + Number(data.credits);
      
      if (newTotalCredits > 30) {
        throw new Error(`Le total des crédits ne peut pas dépasser 30. Actuellement: ${currentTotalCredits}, Après ajout: ${newTotalCredits}`);
      }
      
      await createUE(semesterId!, data.name, Number(data.credits));
      setIsCreating(false);
      reset();
      toast.success('UE créée avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: UEFormInputs) => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      // Check if total credits after edit would exceed 30
      const currentUE = semesterWithCalculations.ues.find(ue => ue.id === editingId);
      if (!currentUE) throw new Error('UE non trouvée');
      
      const otherUEsCredits = semesterWithCalculations.ues
        .filter(ue => ue.id !== editingId)
        .reduce((sum, ue) => sum + ue.credits, 0);
      
      const newTotalCredits = otherUEsCredits + Number(data.credits);
      
      if (newTotalCredits > 30) {
        throw new Error(`Le total des crédits ne peut pas dépasser 30. Après modification: ${newTotalCredits}`);
      }
      
      await updateUE(editingId, data.name, Number(data.credits));
      setEditingId(null);
      toast.success('UE mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette UE ? Toutes les données associées seront perdues.')) {
      setIsLoading(true);
      try {
        await deleteUE(id);
        toast.success('UE supprimée');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startEdit = (id: string, name: string, credits: number) => {
    setEditingId(id);
    setValue('name', name);
    setValue('credits', credits);
  };

  const totalCredits = semesterWithCalculations.ues.reduce((sum, ue) => sum + ue.credits, 0);
  const remainingCredits = 30 - totalCredits;

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link
          to={`/academic-years/${yearId}`}
          className="mr-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à {year.title}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{semester.title}</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Résumé du semestre</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Crédits</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {semesterWithCalculations.validatedCredits} / {semesterWithCalculations.totalCredits}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Restants: {remainingCredits})
                </span>
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Moyenne</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {semesterWithCalculations.average !== null ? 
                  `${semesterWithCalculations.average.toFixed(2)}/20` : 
                  'N/A'
                }
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">UE validées</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {semesterWithCalculations.ues.filter(ue => ue.isValid).length} / {semesterWithCalculations.ues.length}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Unités d'Enseignement (UE)</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={remainingCredits <= 0}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle UE
        </button>
      </div>
      
      {remainingCredits <= 0 && semesterWithCalculations.ues.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Limite de crédits atteinte</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Vous avez atteint la limite de 30 crédits pour ce semestre. Pour ajouter une nouvelle UE, vous devez d'abord supprimer ou modifier une UE existante.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isCreating && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Nouvelle UE</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Créez une nouvelle unité d'enseignement (UE) avec un nombre de crédits.</p>
            </div>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom de l'UE
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      {...register('name', { 
                        required: 'Le nom est requis' 
                      })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="ex: Mathématiques"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                    Crédits
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="credits"
                      min="1"
                      max={remainingCredits}
                      {...register('credits', { 
                        required: 'Les crédits sont requis',
                        min: {
                          value: 1,
                          message: 'Le minimum est 1 crédit'
                        },
                        max: {
                          value: remainingCredits,
                          message: `Le maximum est ${remainingCredits} crédit${remainingCredits > 1 ? 's' : ''}`
                        }
                      })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                    {errors.credits && (
                      <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
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
      
      {semesterWithCalculations.ues.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune UE</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer une unité d'enseignement pour ce semestre.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer une UE
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {semesterWithCalculations.ues.map(ue => (
              <li key={ue.id} className="px-4 py-4 sm:px-6">
                {editingId === ue.id ? (
                  <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                          Nom de l'UE
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="edit-name"
                            {...registerEdit('name', { 
                              required: 'Le nom est requis' 
                            })}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="edit-credits" className="block text-sm font-medium text-gray-700">
                          Crédits
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id="edit-credits"
                            min="1"
                            max={remainingCredits + (ue.credits || 0)}
                            {...registerEdit('credits', { 
                              required: 'Les crédits sont requis',
                              min: {
                                value: 1,
                                message: 'Le minimum est 1 crédit'
                              },
                              max: {
                                value: remainingCredits + (ue.credits || 0),
                                message: `Le maximum est ${remainingCredits + (ue.credits || 0)} crédit${remainingCredits + (ue.credits || 0) > 1 ? 's' : ''}`
                              }
                            })}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {ue.isValid ? (
                          <span className="flex-shrink-0 h-4 w-4 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex-shrink-0 h-4 w-4 text-red-500">
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                        <h4 className="ml-2 text-lg font-medium text-gray-900">{ue.name}</h4>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {ue.credits} crédit{ue.credits > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(ue.id, ue.name, ue.credits)}
                          className="p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ue.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {ue.average !== null ? 
                            `Moyenne: ${ue.average.toFixed(2)}/20` : 
                            'Moyenne: N/A'
                          }
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {ue.subjects.length} matière{ue.subjects.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Link
                          to={`/academic-years/${yearId}/semester/${semesterId}/ue/${ue.id}`}
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Gérer cette UE
                        </Link>
                      </div>
                    </div>
                    
                    {/* Subject list */}
                    {ue.subjects.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700">Matières:</h5>
                        <ul className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {ue.subjects.map(subject => (
                            <li key={subject.id} className="flex items-center text-sm">
                              <span className={`h-2 w-2 rounded-full mr-2 ${
                                subject.status === 'success' ? 'bg-green-500' :
                                subject.status === 'warning' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}></span>
                              <span className="truncate">{subject.name}</span>
                              {subject.finalAverage !== null && (
                                <span className="ml-1 text-gray-500">
                                  ({subject.finalAverage.toFixed(2)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SemesterDetail;