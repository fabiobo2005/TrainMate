import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-blue-500 via-orange-500 to-lime-500 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
