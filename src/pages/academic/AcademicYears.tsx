import { useState } from 'react';
import { useAcademic } from '../../contexts/AcademicContext';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface YearFormInputs {
  title: string;
}

const AcademicYears = () => {
  const { academicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } = useAcademic();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<YearFormInputs>();
  const { register: registerEdit, handleSubmit: handleEditSubmit, setValue } = useForm<YearFormInputs>();

  const onCreateSubmit = async (data: YearFormInputs) => {
    setIsLoading(true);
    try {
      await createAcademicYear(data.title);
      setIsCreating(false);
      reset();
      toast.success('Année académique créée avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  const onEditSubmit = async (data: YearFormInputs) => {
    if (!editingId) return;
    
    setIsLoading(true);
    try {
      await updateAcademicYear(editingId, data.title);
      setEditingId(null);
      toast.success('Année académique mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette année académique ? Toutes les données associées seront perdues.')) {
      setIsLoading(true);
      try {
        await deleteAcademicYear(id);
        toast.success('Année académique supprimée');
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Années académiques</h1>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouvelle année
        </button>
      </div>
      
      {isCreating && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Nouvelle année académique</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Donnez un titre à votre année académique, par exemple "2024-2025".</p>
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
                  placeholder="2024-2025"
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
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {academicYears.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              <p>Aucune année académique créée</p>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Créer une année
                </button>
              )}
            </li>
          ) : (
            academicYears.map(year => (
              <li key={year.id} className="px-4 py-4 sm:px-6">
                {editingId === year.id ? (
                  <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex items-center">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{year.title}</h4>
                        <p className="text-sm text-gray-500">
                          {year.semesters.length} semestre{year.semesters.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(year.id, year.title)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(year.id)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/academic-years/${year.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Gérer
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AcademicYears;