import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="z-10 max-w-md w-full bg-white backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-blue-100 shadow-md">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">ValidEtu</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte étudiant
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">Adresse email</label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="votre@email.com"
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide',
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="••••••••"
                {...register('password', {
                  required: 'Le mot de passe est requis',
                  minLength: {
                    value: 6,
                    message: 'Au moins 6 caractères',
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
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
            Connexion
          </button>

          <div className="text-sm text-center text-gray-400">
            Pas de compte ?{' '}
            <Link to="/register" className="font-medium text-blue-400 hover:underline">
              Inscrivez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
