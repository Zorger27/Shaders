// import 'react-i18next';
//
// // отключает строгую проверку ключей
// declare module 'react-i18next' {
//   interface CustomTypeOptions {
//     // отключает строгую типизацию ключей
//     defaultNS: 'translation';
//     returnNull: false;
//     allowObjectInHTMLChildren: true;
//   }
// }

declare module 'react-i18next' {
  function useTranslation(): {
    t(key: string, options?: any): string;
  };
}