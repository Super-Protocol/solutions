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
    
      let res: number[] = [];
    
      if (typeof msg !== 'string') {
        return new Uint8Array(msg);
      }
    
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0) {
        msg = '0' + msg;
      }
      for (let i = 0; i < msg.length; i += 2) {
        res.push(parseInt(msg[i] + msg[i + 1], 16));
      }
    
      return new Uint8Array(res);
    }
  
    static importFromDER(signature: string): {
      r: string,
      s: string
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
      if (len + p.place !== data.length) {
        throw new Error('Invald DER');
      }
      if (data[p.place++] !== 0x02) {
        throw new Error('Invald DER');
      }
      const rlen = Signature.getLength(data, p);
      if (rlen === false) {
        throw new Error('Invald DER');
      }
      let r = data.slice(p.place, rlen + p.place);
      p.place += rlen;
      if (data[p.place++] !== 0x02) {
        throw new Error('Invald DER');
      }
      const slen = this.getLength(data, p);
      if (slen === false) {
        throw new Error('Invald DER');
      }
      if (data.length !== slen + p.place) {
        throw new Error('Invald DER');
      }
      let s = data.slice(p.place, slen + p.place);
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
        s: Buffer.from(s).toString('hex')
      };
    }
  
    static getLength(buf: Uint8Array, p: Position) {
      var initial = buf[p.place++];
      if (!(initial & 0x80)) {
        return initial;
      }
      var octetLen = initial & 0xf;
    
      // Indefinite length or overflow
      if (octetLen === 0 || octetLen > 4) {
        return false;
      }
    
      var val = 0;
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
  