/**
 * Pure mathematical utility functions
 * No side effects, no external dependencies
 */

/**
 * Calculate running (cumulative) mean
 * @param {number[]} arr - Input array
 * @returns {number[]} Running mean array where out[i] = average(arr[0..i])
 * @example runningMean([10, 20, 30]) → [10, 15, 20]
 */
export function runningMean(arr) {
  const out = new Array(arr.length);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    out[i] = sum / (i + 1);
  }
  return out;
}

/**
 * Element-wise conditional selection
 * @param {boolean[]} cond - Condition array
 * @param {number[]} a - Values when true
 * @param {number[]} b - Values when false
 * @returns {number[]} result[i] = cond[i] ? a[i] : b[i]
 * @example where([true, false, true], [1,2,3], [9,8,7]) → [1, 8, 3]
 */
export function where(cond, a, b) {
  const out = new Array(cond.length);
  for (let i = 0; i < cond.length; i++) {
    out[i] = cond[i] ? a[i] : b[i];
  }
  return out;
}

/**
 * Create an array filled with a constant value
 * @param {number} value - Value to fill
 * @param {number} length - Array length
 * @returns {number[]} Array filled with value
 * @example constant(1.0, 3) → [1.0, 1.0, 1.0]
 */
export function constant(value, length) {
  return Array(length).fill(value);
}

/**
 * Element-wise multiplication of two arrays
 * @param {number[]} a - First array
 * @param {number[]} b - Second array
 * @returns {number[]} result[i] = a[i] * b[i]
 */
export function multiply(a, b) {
  const out = new Array(Math.min(a.length, b.length));
  for (let i = 0; i < out.length; i++) {
    out[i] = a[i] * b[i];
  }
  return out;
}

/**
 * Calculate product of multiple arrays element-wise
 * @param {number[][]} arrays - Arrays to multiply
 * @returns {number[]} Product array
 * @example product([[1,2,3], [2,3,4]]) → [2, 6, 12]
 */
export function product(arrays) {
  if (arrays.length === 0) return [];

  const length = arrays[0].length;
  const out = new Array(length);

  for (let i = 0; i < length; i++) {
    let prod = 1.0;
    for (const arr of arrays) {
      prod *= arr[i];
    }
    out[i] = prod;
  }

  return out;
}
