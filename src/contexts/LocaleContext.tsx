'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Locale = 'ko' | 'en';
type Currency = 'KRW' | 'USD';

interface LocaleContextType {
  locale: Locale;
  currency: Currency;
  setLocale: (locale: Locale) => void;
  formatPrice: (amount: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Detect locale from pathname or localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'ko' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    } else if (pathname.startsWith('/en')) {
      setLocaleState('en');
    }
  }, [pathname]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);

    // Update URL if needed
    const currentPath = pathname.replace(/^\/(ko|en)/, '') || '/';
    if (newLocale === 'ko') {
      router.push(currentPath);
    } else {
      router.push(`/${newLocale}${currentPath}`);
    }
  };

  const currency: Currency = locale === 'ko' ? 'KRW' : 'USD';

  const formatPrice = (amount: number) => {
    if (currency === 'KRW') {
      return `₩${amount.toLocaleString('ko-KR')}`;
    } else {
      // Convert KRW to USD (approximate rate: 1 USD = 1300 KRW)
      const usdAmount = (amount / 1300).toFixed(2);
      return `$${usdAmount}`;
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, currency, setLocale, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
