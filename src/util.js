export const domPromsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;

const toString = Object.prototype.toString;
export const isPlainObj = (value) => toString(value) === "[object Object]";

// 计算最长递增子序列
export function lis(seq) {
  const valueToMax = {};
  let len = seq.length;
  for (let i = 0; i < len; i++) {
    valueToMax[seq[i]] = 1;
  }
  let i = len - 1;
  let last = seq[i];
  let prev = seq[i - 1];
  while (typeof prev !== "undefined") {
    let j = i;
    while (j < len) {
      last = seq[j];
      if (prev < last) {
        const currentMax = valueToMax[last] + 1;
        valueToMax[prev] =
          valueToMax[prev] !== 1
            ? valueToMax[prev] > currentMax
              ? valueToMax[prev]
              : currentMax
            : currentMax;
      }
      j++;
    }
    i--;
    last = seq[i];
    prev = seq[i - 1];
  }

  const lis = [];
  i = 1;
  while (--len >= 0) {
    const n = seq[len];
    if (valueToMax[n] === i) {
      i++;
      lis.unshift(len);
    }
  }

  return lis;
}


// 计算最长递增子序列 2
export function lis1(arr) {
  const p = arr.slice();
  const result = [0];
  let i;
  let j;
  let u;
  let v;
  let c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
