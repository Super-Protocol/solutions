class Position {
  place: number;

  constructor() {
    this.place = 0;
  }
}

export class Signature {
  static toArray(msg: string | Array<number> | null): Uint8Array {
    if (Array.isArray(msg)) {
      return new Uint8Array(msg);
    }

    if (!msg) {
      return new Uint8Array();
    }

    const res: number[] = [];

    if (typeof msg !== 'string') {
      return new Uint8Array(msg);
    }

    msg = msg.replace(/[^a-z0-9]+/gi, '');
    if (msg.length % 2 !== 0) {
      msg = '0' + msg;
    }
    for (let i = 0; i < msg.length; i += 2) {
      res.push(parseInt(msg[i] + msg[i + 1], 16));
    }

    return new Uint8Array(res);
  }

  static importFromDER(signature: string): {
    r: string;
    s: string;
  } {
    const data = Signature.toArray(signature);
    const p = new Position();
    if (data[p.place++] !== 0x30) {
      throw new Error('Invald DER');
    }
    const len = Signature.getLength(data, p);
    if (len === false) {
      throw new Error('Invald DER');
    }
    if (Number(len) + p.place !== data.length) {
      throw new Error('Invald DER');
    }
    if (data[p.place++] !== 0x02) {
      throw new Error('Invald DER');
    }
    const rlen = Signature.getLength(data, p);
    if (rlen === false) {
      throw new Error('Invald DER');
    }
    let r = data.slice(p.place, Number(rlen) + p.place);
    p.place += Number(rlen);
    if (data[p.place++] !== 0x02) {
      throw new Error('Invald DER');
    }
    const slen = this.getLength(data, p);
    if (slen === false) {
      throw new Error('Invald DER');
    }
    if (data.length !== Number(slen) + p.place) {
      throw new Error('Invald DER');
    }
    let s = data.slice(p.place, Number(slen) + p.place);
    if (r[0] === 0) {
      if (r[1] & 0x80) {
        r = r.slice(1);
      } else {
        throw new Error('Leading zeroes');
      }
    }
    if (s[0] === 0) {
      if (s[1] & 0x80) {
        s = s.slice(1);
      } else {
        throw new Error('Leading zeroes');
      }
    }

    return {
      r: Buffer.from(r).toString('hex'),
      s: Buffer.from(s).toString('hex'),
    };
  }

  static getLength(buf: Uint8Array, p: Position): number | boolean {
    const initial = buf[p.place++];
    if (!(initial & 0x80)) {
      return initial;
    }
    const octetLen = initial & 0xf;

    // Indefinite length or overflow
    if (octetLen === 0 || octetLen > 4) {
      return false;
    }

    let val = 0;
    let off = p.place;
    for (let i = 0; i < octetLen; i++, off++) {
      val <<= 8;
      val |= buf[off];
      val >>>= 0;
    }

    // Leading zeroes
    if (val <= 0x7f) {
      return false;
    }

    p.place = off;
    return val;
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `ErrorMessage: ${error.message}; ErrorStack: ${error.stack}`;
  }

  return `Json Error: ${JSON.stringify(error)}`;
};

export const getDenominator = (number: string): string => {
  const [, fraction] = number.split('.');
  const fractionLength = fraction ? fraction.length : 0;

  return Math.pow(10, fractionLength).toString();
};
