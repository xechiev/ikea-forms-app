import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const displayTitle = title || t('app.name');

  return (
    <header className="bg-ikea-blue text-white sticky top-0 z-50 shadow-md">
      <div className="flex items-center h-14 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors touch-target"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        
        <h1 className="text-lg font-semibold flex-1 truncate">
          {displayTitle}
        </h1>

        {/* IKEA Logo */}
        <div className="flex items-center">
          <span className="font-bold text-ikea-yellow text-xl">IKEA</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
