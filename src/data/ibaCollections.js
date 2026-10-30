/* ============================================================
   BARLOG — три офіційні категорії IBA.
   Идентификаторы стабильные — на них опирается логика фильтрации.
   Лейблы — официальные английские названия, не переводятся.
   descriptionKey указывает на ключ в src/i18n/translations.js.
   ============================================================ */

export const IBA_COLLECTIONS = [
  {
    id: 'the-unforgettables',
    name: 'The Unforgettables',
    descriptionKey: 'library.collectionUnforgettables',
  },
  {
    id: 'contemporary-classics',
    name: 'Contemporary Classics',
    descriptionKey: 'library.collectionContemporaryClassics',
  },
  {
    id: 'new-era-drinks',
    name: 'New Era Drinks',
    descriptionKey: 'library.collectionNewEraDrinks',
  },
];