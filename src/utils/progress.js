export function getPackingProgress(items = []) {
  const totalCount = items.length;

  const packedCount = items.filter(
    (item) => item.isPacked
  ).length;

  const percentage =
    totalCount === 0
      ? 0
      : Math.round((packedCount / totalCount) * 100);

  return {
    packedCount,
    totalCount,
    percentage,
  };
}