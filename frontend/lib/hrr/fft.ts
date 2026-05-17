const TAU = 2 * Math.PI;

export function fft(real: Float64Array): [Float64Array, Float64Array] {
  const n = real.length;
  const re = new Float64Array(real);
  const im = new Float64Array(n);
  bitReverse(re, im, n);
  butterfly(re, im, n, false);
  return [re, im];
}

export function ifft(re: Float64Array, im: Float64Array): Float64Array {
  const n = re.length;
  const outRe = new Float64Array(re);
  const outIm = new Float64Array(im);
  bitReverse(outRe, outIm, n);
  butterfly(outRe, outIm, n, true);
  const invN = 1 / n;
  for (let i = 0; i < n; i++) outRe[i] *= invN;
  return outRe;
}

export function complexMultiply(
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array
): [Float64Array, Float64Array] {
  const n = aRe.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    re[i] = aRe[i] * bRe[i] - aIm[i] * bIm[i];
    im[i] = aRe[i] * bIm[i] + aIm[i] * bRe[i];
  }
  return [re, im];
}

export function complexMultiplyConj(
  aRe: Float64Array,
  aIm: Float64Array,
  bRe: Float64Array,
  bIm: Float64Array
): [Float64Array, Float64Array] {
  const n = aRe.length;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    re[i] = aRe[i] * bRe[i] + aIm[i] * bIm[i];
    im[i] = -aRe[i] * bIm[i] + aIm[i] * bRe[i];
  }
  return [re, im];
}

function bitReverse(re: Float64Array, im: Float64Array, n: number) {
  const bits = Math.log2(n) | 0;
  for (let i = 0; i < n; i++) {
    const j = reverseBits(i, bits);
    if (j > i) {
      let tmp = re[i]; re[i] = re[j]; re[j] = tmp;
      tmp = im[i]; im[i] = im[j]; im[j] = tmp;
    }
  }
}

function reverseBits(x: number, bits: number): number {
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (x & 1);
    x >>= 1;
  }
  return result;
}

function butterfly(re: Float64Array, im: Float64Array, n: number, inverse: boolean) {
  for (let size = 2; size <= n; size *= 2) {
    const half = size / 2;
    const sign = inverse ? 1 : -1;
    const angleStep = (sign * TAU) / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < half; k++) {
        const angle = angleStep * k;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const evenIdx = i + k;
        const oddIdx = i + k + half;
        const tRe = cos * re[oddIdx] - sin * im[oddIdx];
        const tIm = sin * re[oddIdx] + cos * im[oddIdx];
        re[oddIdx] = re[evenIdx] - tRe;
        im[oddIdx] = im[evenIdx] - tIm;
        re[evenIdx] += tRe;
        im[evenIdx] += tIm;
      }
    }
  }
}
