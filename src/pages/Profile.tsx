import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { User, UserCircle, Lock } from 'lucide-react';

interface ProfileFormInputs {
  nom: string;
  prenom: string;
  email: string;
}

interface PasswordFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const Profile = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit, 
    formState: { errors: profileErrors } 
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      nom: currentUser?.nom || '',
      prenom: currentUser?.prenom || '',
      email: currentUser?.email || '',
    }
  });
  
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors } 
  } = useForm<PasswordFormInputs>();
  
  const newPassword = watch('newPassword');

  const onProfileSubmit = async (data: ProfileFormInputs) => {
    setIsUpdatingProfile(true);
    try {
      await updateProfile(data);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormInputs) => {
    setIsUpdatingPassword(true);
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      resetPassword();
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun utilisateur connecté</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
              <p className="text-sm text-gray-500">
                Mettez à jour vos informations personnelles
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  {...registerProfile('nom', { 
                    required: 'Le nom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le nom doit contenir au moins 2 caractères'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {profileErrors.nom && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.nom.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  {...registerProfile('prenom', { 
                    required: 'Le prénom est requis',
                    minLength: {
                      value: 2,
                      message: 'Le prénom doit contenir au moins 2 caractères'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {profileErrors.prenom && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.prenom.message}</p>
                )}
              </div>

              <div className="col-span-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  {...registerProfile('email', { 
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Adresse email invalide'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
              <p className="text-sm text-gray-500">
                Mettez à jour votre mot de passe
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  {...registerPassword('currentPassword', { 
                    required: 'Le mot de passe actuel est requis'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...registerPassword('newPassword', { 
                    required: 'Le nouveau mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  {...registerPassword('confirmNewPassword', { 
                    required: 'Veuillez confirmer votre nouveau mot de passe',
                    validate: value => value === newPassword || 'Les mots de passe ne correspondent pas'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {passwordErrors.confirmNewPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmNewPassword.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isUpdatingPassword ? 'Mise à jour...' : 'Modifier le mot de passe'}
              </button>
            </div>
          </form>
          <div className="mt-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg text-sm sm:text-base leading-relaxed">
  <strong>⚠️ Attention :</strong> Cette version 1.0.0 (bêta publique) ne prend pas en charge l'utilisation d'un même compte sur plusieurs appareils.  
  Toutes les données sont enregistrées uniquement dans le navigateur utilisé lors de la création du compte (stockage local).  
  <br className="hidden sm:block" />
  Il n'existe aucune synchronisation entre navigateurs ou appareils.  
  <br className="hidden sm:block" />
  Si vous changez d'appareil ou videz les caches de votre navigateur, toutes vos données seront définitivement perdues.
  <br className="hidden sm:block" />
  De plus, en cas d'oubli de mot de passe, le compte est irrécupérable.
  <br className="hidden sm:block" />
  <strong>ℹ️ Nous travaillons activement à améliorer ValidEtu afin de résoudre ces limitations et proposer une solution plus robuste et sécurisée.</strong>
</div>


        </div>
      </div>
    </div>
  );
};

export default Profile;