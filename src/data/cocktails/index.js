/* ============================================================
   BARLOG — агрегатор коктейлів.
   Збирає всі категорії IBA в один масив cocktails,
   щоб інші частини застосунку могли імпортувати
   єдине джерело даних, як і раніше:
     import { cocktails } from '../data/cocktails';

   Щоб додати нову категорію:
   1. Створіть файл <category-name>.js у цій папці.
   2. Експортуйте з нього масив з назвою змінної у camelCase.
   3. Додайте імпорт та spread сюди.
   ============================================================ */

import { theUnforgettables } from './the-unforgettables';
import { contemporaryClassics } from './contemporary-classics';
import { newEraDrinks } from './new-era-drinks';

export const cocktails = [
  ...theUnforgettables,
  ...contemporaryClassics,
  ...newEraDrinks,
];