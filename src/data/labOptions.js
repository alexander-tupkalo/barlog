/* ============================================================
   BARLOG — опції для рецептів My Lab.
   Стабільні id + локалізовані лейбли через ключі перекладів.
   ============================================================ */

export const CATEGORIES = [
  { id: 'classic', labelKey: 'lab.form.categoryClassic' },
  { id: 'sour', labelKey: 'lab.form.categorySour' },
  { id: 'long-drink', labelKey: 'lab.form.categoryLongDrink' },
  { id: 'author', labelKey: 'lab.form.categoryAuthor' },
  { id: 'other', labelKey: 'lab.form.categoryOther' },
];

export const METHODS = [
  { id: 'shake', labelKey: 'lab.form.methodShake' },
  { id: 'stir', labelKey: 'lab.form.methodStir' },
  { id: 'build', labelKey: 'lab.form.methodBuild' },
  { id: 'blend', labelKey: 'lab.form.methodBlend' },
];

export const GLASSWARE_OPTIONS = [
  { id: 'coupe', labelKey: 'lab.form.glassCoupe' },
  { id: 'martini', labelKey: 'lab.form.glassMartini' },
  { id: 'rocks', labelKey: 'lab.form.glassRocks' },
  { id: 'highball', labelKey: 'lab.form.glassHighball' },
  { id: 'margarita', labelKey: 'lab.form.glassMargarita' },
  { id: 'other', labelKey: 'lab.form.glassOther' },
];

export const ICE_OPTIONS = [
  { id: 'cube-large', labelKey: 'lab.form.iceCubeLarge' },
  { id: 'cube-small', labelKey: 'lab.form.iceCubeSmall' },
  { id: 'crushed', labelKey: 'lab.form.iceCrushed' },
  { id: 'none', labelKey: 'lab.form.iceNone' },
];

export const UNITS = [
  { id: 'ml', labelKey: 'lab.form.unitMl' },
  { id: 'g', labelKey: 'lab.form.unitG' },
  { id: 'pcs', labelKey: 'lab.form.unitPcs' },
  { id: 'dash', labelKey: 'lab.form.unitDash' },
  { id: 'barspoon', labelKey: 'lab.form.unitBarspoon' },
  { id: 'to-taste', labelKey: 'lab.form.unitToTaste' },
];