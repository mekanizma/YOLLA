import React from 'react';

interface Badge {
  id: number;
  icon: string;
  title: string;
  desc: string;
}

interface BadgesSectionProps {
  badges: Badge[];
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ badges }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fadeInUp">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Rozetler & Başarılar <span className="text-2xl">🏅</span></h2>
      <div className="flex flex-col gap-4">
        {badges.map(badge => (
          <div key={badge.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
            <span className="text-3xl">{badge.icon}</span>
            <div>
              <h3 className="font-semibold text-base">{badge.title}</h3>
              <p className="text-xs text-gray-500">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgesSection; 