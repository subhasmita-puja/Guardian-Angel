
import './global.css';
import { PT_Sans } from 'next/font/google';
import { RootWrapper } from '@/components/root-wrapper';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-pt-sans',
});

export const metadata = {
  title: 'Guardian Angel',
  description: 'Your public transport safety companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <RootWrapper fontClass={ptSans.variable}>{children}</RootWrapper>
    </html>
  );
}
