import React from 'react';

interface ProfileCompletionBoxProps {
  completion: number;
  missingFields: string[];
}

const ProfileCompletionBox: React.FC<ProfileCompletionBoxProps> = ({ completion, missingFields }) => {
  const isComplete = completion >= 100;
  return (
    <div className="bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl p-5 flex flex-col items-center text-center shadow">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="font-semibold text-green-700">Profil Tamamlanma</span>
        <span className="font-bold text-green-800">%{completion}</span>
      </div>
      <div className="w-full bg-green-200 rounded-full h-3 mb-3">
        <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${completion}%` }} />
      </div>
      {!isComplete ? (
        <>
          <p className="text-sm text-green-700 mb-2">Profilini tamamlamak için eksik alanlar:</p>
          <ul className="flex flex-wrap gap-2 justify-center mb-2">
            {missingFields.map((field, i) => (
              <li key={i} className="bg-white border border-green-300 rounded px-2 py-1 text-xs text-green-800">{field}</li>
            ))}
          </ul>
          <p className="text-xs text-green-600">Tüm alanları doldur, <span className="font-semibold">özel rozet</span> kazan!</p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">🎉</span>
          <p className="text-green-800 font-semibold">Tebrikler! Profilini %100 tamamladın ve rozet kazandın!</p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBox; 