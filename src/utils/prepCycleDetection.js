/* ============================================================
   BARLOG — обнаружение циклических зависимостей между п/ф.
   Чистая функция, не зависит от React.
   ============================================================ */

/**
 * Проверяет, создаст ли сохранение препарата с предложенными
   ссылками на другие п/ф циклическую зависимость.
 *
   Цикл возникает, если следуя по цепочке ссылок от предложенных
   ингредиентов, мы возвращаемся к сохраняемому препарату.
 *
   Пример: A → B → C → A — цикл.
 *
 * @param {string|null} targetId — ID препарата (null для нового)
 * @param {Array} proposedIngredients — ингредиенты сохраняемого препарата
 * @param {Array} allPrepProducts — все существующие препараты
 * @returns {boolean} true, если цикл обнаружен
 */
export function wouldCreateCycle(targetId, proposedIngredients, allPrepProducts) {
  if (!targetId || !Array.isArray(proposedIngredients) || !Array.isArray(allPrepProducts)) {
    return false;
  }

  // Собираем все предложенные refId (ссылки на другие п/ф).
  const proposedRefIds = proposedIngredients
    .filter((ing) => ing.refType === 'prep' && ing.refId)
    .map((ing) => ing.refId);

  if (proposedRefIds.length === 0) return false;

  // Строим карту ссылок: productId -> [refId, refId, ...]
  // Исключаем редактируемый препарат — используем proposedIngredients вместо него.
  const refMap = new Map();
  for (const product of allPrepProducts) {
    if (product.id === targetId) continue;
    const refs = Array.isArray(product.ingredients)
      ? product.ingredients
          .filter((ing) => ing.refType === 'prep' && ing.refId)
          .map((ing) => ing.refId)
      : [];
    refMap.set(product.id, refs);
  }

  // Для каждого предложенного refId — BFS: если цепочка ведёт к targetId — цикл.
  for (const refId of proposedRefIds) {
    if (refId === targetId) return true; // Прямая самоссылка.

    const visited = new Set([targetId]);
    const queue = [refId];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (currentId === targetId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      // Получаем ссылки текущего продукта.
   // Если продукт не найден (удалён) — пропускаем безопасно.
      const currentRefs = refMap.get(currentId);
      if (currentRefs) {
        for (const r of currentRefs) {
          if (!visited.has(r)) {
            queue.push(r);
          }
        }
      }
    }
  }

  return false;
}