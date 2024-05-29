/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value) => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === 'object' &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

export function breakArrayIntoChuncksOf(chunckSize, long_array) {
  console.info('breaking array into smaller chuncks');
  const short_arrays = [];
  for (let i = 0; i < long_array.length; i += chunckSize) {
    short_arrays.push(long_array.slice(i, i + chunckSize));
  }
  console.info(`Orignal Array length: ${long_array.length}`);
  console.info(`Total chuncks created of orginal array: ${short_arrays.length}`);
  return short_arrays;
}
