import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface RegisterFormInputs {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.nom, data.prenom, data.email, data.password);
      toast.success('Inscription réussie');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#f8fafc', // Fond blanc
      }}
    >
      <div className="z-10 max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-300">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 shadow-md">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-black">ValidEtu</h2>
          <p className="mt-1 text-sm text-gray-500">
            Créez votre compte pour gérer vos résultats académiques
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                id="nom"
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400"
                placeholder="Nom"
                {...register('nom', { 
                  required: 'Le nom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le nom doit contenir au moins 2 caractères'
                  }
                })}
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                id="prenom"
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400"
                placeholder="Prénom"
                {...register('prenom', { 
                  required: 'Le prénom est requis',
                  minLength: {
                    value: 2,
                    message: 'Le prénom doit contenir au moins 2 caractères'
                  }
                })}
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-500">{errors.prenom.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email</label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400"
                placeholder="votre@email.com"
                {...register('email', { 
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400"
                placeholder="Mot de passe"
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Le mot de passe doit contenir au moins 6 caractères'
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 placeholder-gray-400"
                placeholder="Confirmer le mot de passe"
                {...register('confirmPassword', { 
                  required: 'Veuillez confirmer votre mot de passe',
                  validate: value => value === password || 'Les mots de passe ne correspondent pas'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting && (
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            S'inscrire
          </button>

          <div className="text-sm text-center text-gray-400">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-medium text-blue-500 hover:underline">
              Connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
