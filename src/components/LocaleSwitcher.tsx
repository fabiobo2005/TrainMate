'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {ChangeEvent, useTransition} from 'react';

export default function LocaleSwitcher() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(`/${nextLocale}`);
    });
  }

  return (
    <div className="relative">
      <label htmlFor="locale-select" className="sr-only">
        {t('selector')}
      </label>
      <select
        id="locale-select"
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        defaultValue={locale}
        disabled={isPending}
        onChange={onSelectChange}
        title={t('selector')}
      >
        <option value="pt">{t('portuguese')}</option>
        <option value="en">{t('english')}</option>
        <option value="es">{t('spanish')}</option>
      </select>
    </div>
  );
}
