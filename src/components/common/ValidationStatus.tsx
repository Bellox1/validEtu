import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ValidationStatusProps {
  status: 'success' | 'warning' | 'danger';
  message: string;
}

const ValidationStatus = ({ status, message }: ValidationStatusProps) => {
  return (
    <div 
      className={`p-4 rounded-md ${
        status === 'success' ? 'bg-green-50' : 
        status === 'warning' ? 'bg-yellow-50' : 
        'bg-red-50'
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {status === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : status === 'warning' ? (
            <Clock className="h-5 w-5 text-yellow-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${
            status === 'success' ? 'text-green-800' : 
            status === 'warning' ? 'text-yellow-800' : 
            'text-red-800'
          }`}>
            {status === 'success' ? 'Validé' : 
             status === 'warning' ? 'En attente' : 
             'Non validé'}
          </h3>
          <div className={`mt-2 text-sm ${
            status === 'success' ? 'text-green-700' : 
            status === 'warning' ? 'text-yellow-700' : 
            'text-red-700'
          }`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationStatus;