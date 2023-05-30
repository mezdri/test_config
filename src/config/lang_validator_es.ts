export default {
  name: 'es',
  messages: {
    _default: function(e: any) {
      return 'El campo ' + e + ' no es válido.';
    },
    after: function(e: any, n: any) {
      var o = n[0];
      return (
        'El campo ' +
        e +
        ' debe ser posterior ' +
        (n[1] ? 'o igual ' : '') +
        'a ' +
        o +
        '.'
      );
    },
    alpha_dash: function(e: any) {
      return 'El campo ' + e + ' solo debe contener letras, números y guiones.';
    },
    alpha_num: function(e: any) {
      return 'El campo ' + e + ' solo debe contener letras y números.';
    },
    alpha_spaces: function(e: any) {
      return 'El campo ' + e + ' solo debe contener letras y espacios.';
    },
    alpha: function(e: any) {
      return 'El campo ' + e + ' solo debe contener letras.';
    },
    before: function(e: any, n: any) {
      var o = n[0];
      return (
        'El campo ' +
        e +
        ' debe ser anterior ' +
        (n[1] ? 'o igual ' : '') +
        'a ' +
        o +
        '.'
      );
    },
    between: function(e: any, n: any) {
      return 'El campo ' + e + ' debe estar entre ' + n[0] + ' y ' + n[1] + '.';
    },
    confirmed: function(e: any) {
      return 'El campo ' + e + ' no coincide.';
    },
    credit_card: function(e: any) {
      return 'El campo ' + e + ' es inválido.';
    },
    date_between: function(e: any, n: any) {
      return 'El campo ' + e + ' debe estar entre ' + n[0] + ' y ' + n[1] + '.';
    },
    date_format: function(e: any, n: any) {
      return 'El campo ' + e + ' debe tener formato formato ' + n[0] + '.';
    },
    decimal: function(e: any, n: any) {
      void 0 === n && (n = []);
      var o = n[0];
      return (
        void 0 === o && (o = '*'),
        'El campo ' +
          e +
          ' debe ser numérico y contener ' +
          ('*' === o ? '' : o) +
          ' puntos decimales.'
      );
    },
    digits: function(e: any, n: any) {
      return (
        'El campo ' +
        e +
        ' debe ser numérico y contener exactamente ' +
        n[0] +
        ' dígitos.'
      );
    },
    dimensions: function(e: any, n: any) {
      return (
        'El campo ' +
        e +
        ' debe ser de ' +
        n[0] +
        ' píxeles por ' +
        n[1] +
        ' píxeles.'
      );
    },
    email: function() {
      return '* Correo Electrónico inválido.';
    },
    ext: function(e: any) {
      return 'El campo ' + e + ' debe ser un archivo válido.';
    },
    image: function(e: any) {
      return 'El campo ' + e + ' debe ser una imagen.';
    },
    included: function(e: any) {
      return 'El campo ' + e + ' debe ser un valor válido.';
    },
    integer: function(e: any) {
      return 'El campo ' + e + ' debe ser un entero.';
    },
    ip: function(e: any) {
      return 'El campo ' + e + ' debe ser una dirección ip válida.';
    },
    length: function(e: any, n: any) {
      var o = n[0],
        r = n[1];
      return r
        ? 'El largo del campo ' + e + ' debe estar entre ' + o + ' y ' + r + '.'
        : 'El largo del campo ' + e + ' debe ser ' + o + '.';
    },
    max: function(e: any, n: any) {
      return 'El campo ' + e + ' no debe ser mayor a ' + n[0] + ' caracteres.';
    },
    max_value: function(e: any, n: any) {
      return 'El campo ' + e + ' debe de ser ' + n[0] + ' o menor.';
    },
    mimes: function(e: any) {
      return 'El campo ' + e + ' debe ser un tipo de archivo válido.';
    },
    min: function(e: any, n: any) {
      return 'El campo ' + e + ' debe tener al menos ' + n[0] + ' caracteres.';
    },
    min_value: function(e: any, n: any) {
      return 'El campo ' + e + ' debe ser ' + n[0] + ' o superior.';
    },
    excluded: function(e: any) {
      return 'El campo ' + e + ' debe ser un valor válido.';
    },
    numeric: function(e: any) {
      return 'El campo ' + e + ' debe contener solo caracteres numéricos.';
    },
    regex: function(e: any) {
      return 'El formato del campo ' + e + ' no es válido.';
    },
    required: function(e: any) {
      return '* Campo requerido';
    },
    // size: function(e: any, n: any) {
    //     var o, r, t, a = n[0];
    //     return "El campo " + e + " debe ser menor a " + (o = a, r = 1024, t = 0 == (o = Number(o) * r) ? 0 : Math.floor(Math.log(o) / Math.log(r)), 1 * (o / Math.pow(r, t)).toFixed(2) + " " + ["Byte", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][t]) + "."
    // },
    url: function(e: any) {
      return 'El campo ' + e + ' no es una URL válida.';
    },
  },
};
