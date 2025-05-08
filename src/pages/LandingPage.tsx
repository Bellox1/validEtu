import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const images = [
    "https://i.pinimg.com/736x/e1/a9/28/e1a928401713aea2bb7be813246dd8d6.jpg",
    "https://i.pinimg.com/736x/d9/07/84/d907849c6a7e75d7f664b378ea557306.jpg",
    "https://i.pinimg.com/736x/8d/aa/e3/8daae33997c997e54be1aa8f39f5bf42.jpg",
    "https://i.pinimg.com/736x/40/cf/cc/40cfcc18bbb7e6c8065f31fc78319a0c.jpg",
  ];
  const animationDuration = 3000;
  const imageSize = 300;  // Taille augmentée des images
  const borderRadius = 20;

  const [rotation, setRotation] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation((prevRotation) => prevRotation + 360);
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, animationDuration);

    return () => clearInterval(intervalId);
  }, []);

  // Compteur animé avant le footer
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (count < 125) {
        setCount((prevCount) => prevCount + 1);
      }
    }, 20); // Vitesse d'animation rapide

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="bg-white">
      <div className="relative bg-blue-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-8 pb-8 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-28 flex items-center justify-between">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                <span className="block">ValidEtu</span>
                <span className="block text-blue-200 text-3xl sm:text-4xl mt-3">
                  Votre succès académique, simplifié
                </span>
              </h1>
              <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto lg:mx-0 md:mt-5 md:text-xl">
                Gérez vos UE, matières, notes et crédits en toute simplicité. Suivez votre progression et obtenez des conseils personnalisés pour réussir.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Créer un compte
                  </button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 md:py-4 md:text-lg md:px-10"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>

            {/* Image animée */}
            <div className="relative hidden sm:flex items-center justify-center w-[300px] h-[300px] rounded-[20px] overflow-hidden shadow-lg">
              <img
                src={images[currentImageIndex]}
                alt="Image animée"
                className="w-full h-full object-cover transition-transform duration-1000 ease-in-out"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  borderRadius: `${borderRadius}px`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

     {/* Features */}
<div className="py-12 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
      <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Fonctionnalités</h2>
      <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Tout ce dont vous avez besoin pour réussir
      </p>
      <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
        ValidEtu vous offre tous les outils nécessaires pour suivre et optimiser votre parcours académique.
      </p>
    </div>
    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          title: "Suivi complet des UE",
          desc: "Gérez facilement vos Unités d'Enseignement, matières et crédits selon le système LMD.",
          iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        },
        {
          title: "Calculs automatiques",
          desc: "Les moyennes, crédits et validations sont calculés automatiquement selon les règles académiques.",
          iconPath: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
        },
        {
          title: "Gestion des rattrapages",
          desc: "Identifiez rapidement les matières en rattrapage et suivez vos opportunités d'amélioration.",
          iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
        },
        {
          title: "Conseils personnalisés",
          desc: "Obtenez des conseils et prédictions adaptés à votre situation pour maximiser vos chances de réussite.",
          iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        },
        {
          title: "Organisation par semestre",
          desc: "Structurez votre année académique en semestres et suivez votre progression globale.",
          iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          title: "Interface intuitive",
          desc: "Profitez d'une interface simple, moderne et fluide pour une meilleure expérience utilisateur.",
          iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2...",
        },
      ].map(({ title, desc, iconPath }, idx) => (
        <div key={idx} className="pt-6">
          <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
            <div className="-mt-6">
              <div>
                <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath} />
                  </svg>
                </span>
              </div>
              <h3 className="mt-8 text-lg font-medium text-gray-900">{title}</h3>
              <p className="mt-5 text-base text-gray-500">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div> {/* Closure added here */}


      {/* Section compteur animé avant le footer */}
      <section className="bg-blue-50 py-8 sm:py-16">
  <div className="max-w-4xl mx-auto text-center px-4">
    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
      +{count} étudiants déjà inscrits
    </h2>
    <p className="mt-2 text-gray-600 text-base sm:text-lg">
      Rejoignez-nous et organisez votre année avec ValidEtu !
    </p>
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
</section>


      <footer className="bg-gradient-to-t from-black via-gray-900 to-gray-800 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
          <div>
            <h4 className="text-xl font-semibold mb-4">ValidEtu</h4>
            <p className="text-sm text-gray-300">
              Plateforme d'aide à la réussite académique pour les étudiants LMD. Suivi des UE, gestion des notes, prédictions de réussite.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="/dashboard" className="hover:underline">Tableau de bord</a></li>
              <li><a href="/login" className="hover:underline">Se connecter</a></li>
              <li><a href="/register" className="hover:underline">Créer un compte</a></li>
              <li><a href="/details" className="hover:underline">Découvrir l'application</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-300">
              Email : <a href="mailto:mantinoubello123@gmail.com" className="hover:underline">support@validetu.app</a><br />
              Téléphone : <a href="tel:+2290146862536" className="hover:underline">+2290146862536</a><br />
              Adresse : Cotonou, Bénin<br />
              LinkedIn : <a href="https://www.linkedin.com/in/mantinoubello" target="_blank" rel="noopener noreferrer" className="hover:underline">Profil LinkedIn</a><br />
              WhatsApp : <a href="https://wa.me/22946862536" target="_blank" rel="noopener noreferrer" className="hover:underline">Contactez-nous sur WhatsApp</a>
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © 2025 ValidEtu. Tous droits réservés. Réservé uniquement pour les systèmes LMD, ne prend pas encore en compte d'autres systèmes.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
