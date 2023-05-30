export class ValidarIMEI {
  private sumarDigitosImei(n: number): number {
    let a: number = 0;
    while (n > 0) {
      a = a + (n % 10);
      let div: string = (n / 10).toString();
      n = parseInt(div, 0);
    }
    return a;
  }

  validar(s: string): boolean {
    let n: number = parseInt(s);
    let len: number = s.length;

    if (len !== 15) {
      return false;
    }

    var sum: number = 0;
    for (let i: number = len; i >= 1; i--) {
      let div: string = (n % 10).toString();
      let d: number = parseInt(div, 0);

      if (i % 2 === 0) {
        d = 2 * d;
      }

      sum += this.sumarDigitosImei(d);
      n = n / 10;
    }

    return sum % 10 === 0;
  }
}
