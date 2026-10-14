import React from 'react';
import { Camera, BookOpen, BarChart3, Factory, MessageSquare, ShieldCheck, Scale } from 'lucide-react';
import { ScreenId } from './Navbar';

interface MobileNavProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentScreen, onSelectScreen }) => {
  const items: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'scan', label: 'Scan', icon: Camera },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'impact', label: 'Impact', icon: BarChart3 },
    { id: 'factory', label: 'Factory', icon: Factory },
    { id: 'assistant', label: 'Assistant', icon: MessageSquare },
    { id: 'responsible', label: 'Safety', icon: ShieldCheck },
    { id: 'evaluation', label: 'Eval', icon: Scale },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex items-center justify-between overflow-x-auto shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectScreen(item.id)}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-2.5 rounded-xl ${
              isActive
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
