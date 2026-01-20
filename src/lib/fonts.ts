import { Montserrat, Raleway, Open_Sans, Nunito, Roboto } from 'next/font/google';

export const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const raleway = Raleway({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap',
});

export const openSans = Open_Sans({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const nunito = Nunito({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const roboto = Roboto({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});
