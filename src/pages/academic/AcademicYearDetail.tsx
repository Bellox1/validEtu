import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAcademic } from '../../contexts/AcademicContext';
import { useForm } from 'react-hook-form';
import { Book, PlusCircle, Edit2, Trash2, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SemesterFormInputs {
  title: string;
}

const AcademicYearDetail = () => {
  const { yearId } = useParams<{ yearId: string }>();
  const navigate = useNavigate();
  const { 
    getAcademicYear, 
    getAcademicYearWithCalculations,
    createSemester,
    updateSemester,
    deleteSemester
  } = useAcademic();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SemesterFormInputs>();
  const { register: registerEdit, handleSubmit: handleEditSubmit, setValue } = useForm<SemesterFormInputs>();

  const year = yearId ? getAcademicYear(yearId) : undefined;
  const yearWithCalculations = yearId ? getAcademicYearWithCalculations(yearId) : undefined;

  useEffect(() => {
    if (!year) {
      navigate('/academic-years');
      toast.error('Année académique non trouvée');
    }
  }, [year, navigate]);

  if (!year || !yearWithCalculations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const onCreateSubmit = async (data: SemesterFormInputs) => {
    setIsLoading(true);
    try {
      await createSemester(yearId!, data.title);
      setIsCreating(false);
      reset();
      toast.success('Semestre créé avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: SemesterFormInputs) => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      await updateSemester(editingId, data.title);
      setEditingId(null);
      toast.success('Semestre mis à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce semestre ? Toutes les données associées seront perdues.')) {
      setIsLoading(true);
      try {
        await deleteSemester(id);
        toast.success('Semestre supprimé');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setValue('title', title);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link
          to="/academic-years"
          className="mr-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{year.title}</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Résumé de l'année</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Crédits validés</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {yearWithCalculations.validatedCredits} / {yearWithCalculations.totalCredits}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1">
                {yearWithCalculations.canProgress ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Validée pour passage
                  </span>
                ) : yearWithCalculations.validatedCredits >= 30 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    En cours
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Risque de redoublement
                  </span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Progression</dt>
              <dd className="mt-1">
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${(yearWithCalculations.validatedCredits / yearWithCalculations.totalCredits) * 100}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${yearWithCalculations.canProgress ? 'bg-green-500' : 'bg-blue-500'}`}
                    ></div>
                  </div>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Semestres</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau semestre
        </button>
      </div>
      
      {isCreating && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Nouveau semestre</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Donnez un titre à votre semestre, par exemple "Semestre 1".</p>
            </div>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="mt-5 sm:flex sm:items-center">
              <div className="w-full sm:max-w-xs">
                <label htmlFor="title" className="sr-only">Titre</label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { 
                    required: 'Le titre est requis' 
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Semestre 1"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0 flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {yearWithCalculations.semesters.length === 0 ? (
          <div className="col-span-2 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">Aucun semestre créé</p>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Créer un semestre
                </button>
              )}
            </div>
          </div>
        ) : (
          yearWithCalculations.semesters.map(semester => (
            <div key={semester.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                {editingId === semester.id ? (
                  <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex items-center w-full">
                    <div className="flex-grow">
                      <input
                        type="text"
                        {...registerEdit('title', { 
                          required: 'Le titre est requis' 
                        })}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Mettre à jour
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                      <Book className="h-5 w-5 mr-2 text-blue-600" />
                      {semester.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(semester.id, semester.title)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(semester.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Crédits validés</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {semester.validatedCredits} / {semester.totalCredits}
                    </dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Moyenne</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {semester.average !== null ? 
                        `${semester.average.toFixed(2)}/20` : 
                        'Non calculée'
                      }
                    </dd>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">UE</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {semester.ues.length === 0 ? (
                        <p className="text-gray-500">Aucune UE créée</p>
                      ) : (
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                          {semester.ues.map(ue => (
                            <li key={ue.id} className="px-3 py-3 flex items-center justify-between text-sm">
                              <div className="flex items-center">
                                <span className={`mr-2 flex-shrink-0 h-2 w-2 rounded-full ${
                                  ue.isValid ? 'bg-green-500' : 'bg-red-500'
                                }`}></span>
                                <span className="truncate">{ue.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-4 text-gray-500">
                                  {ue.credits} crédit{ue.credits > 1 ? 's' : ''}
                                </span>
                                <Link
                                  to={`/academic-years/${yearId}/semester/${semester.id}/ue/${ue.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Gérer
                                </Link>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                </dl>
                
                <div className="mt-5 flex justify-end">
                  <Link
                    to={`/academic-years/${yearId}/semester/${semester.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gérer le semestre
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AcademicYearDetail;