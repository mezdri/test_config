import { SideBarComp } from 'ag-grid-enterprise';
import store from '@/store';
import moment from 'moment';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';
import {
  EstadoTransmision,
  EstadoEntidad,
  TipoRol,
  EstadoAceptarInformacion,
  EstadoCompartirInformacion,
  TipoGeometria,
  TipoSim,
} from '@/config/enums';
import { InfoZonaVm } from '@/interfaces/InfoZonaVm';
import { TipoLugarAlcance } from '@/config/enums';
import { ColDef } from 'ag-grid-community';
import { RepetirDia } from '@/pantallas/Inicio/RepetirDiaData/fetchRepetirDia';

const marcadorRed = require('@/assets/pin-red.png');
const marcadorGreen = require('@/assets/pin-green.png');
const marcadorBlue = require('@/assets/pin-blue.png');

export default {
  errorMensajes: {
    textoRequerido: '* Campo requerido',
    maxLength: '* Largo mayor al permitido',
    minValue: '* El valor no puede ser negativo.',
    soloNumeros: '* Valor debe ser numérico',
    passNoIguales: '* Contraseñas no coinciden',
    regex: '* Campo contiene caracteres o formato inválido',
    faltaFechaRenovacion:
      '* Campo requerido, por favor ingrese la fecha de renovación para cada Licencia.',

    fechaNacimientoMenorAHoy: '* Fecha Nacimiento no puede ser mayor a hoy',
    fechaMayoriaEdad: '* Fecha Nacimiento no cumple con mayoría de edad',
    maxVelocidad: '* Velocidad máxima debe ser un valor entre 0 y 255 km/h.',
  },

  agGridDefaultConfig: {
    toolPanels: [
      // {
      //     sideBar: false,
      //     id: 'columns',
      //     labelDefault: 'Columnas',
      //     labelKey: 'columns',
      //     iconKey: 'columns',
      //    toolPanel: 'agColumnsToolPanel',
      //     toolPanelParams: {
      //         suppressRowGroups: true,
      //         suppressValues: true,
      //         suppressPivots: true,
      //         suppressPivotMode: true,
      //         suppressSideButtons: true,
      //         suppressColumnFilter: false,
      //         suppressColumnSelectAll: true,
      //         suppressColumnExpandAll: false
      //     }
      // }
    ],
    defaultToolPanel: '',
  },
  agGridTextos: {
    // for filter panel
    page: 'Pág',
    more: 'más',
    to: '-',
    of: 'de',
    next: 'Siguinte',
    last: 'Ultimo',
    first: 'Primero',
    previous: 'Anterior',
    loadingOoo: 'Cargando...',
    // for set filter
    selectAll: 'Seleccionar todos',
    searchOoo: 'Buscar...',
    blanks: 'blancos',
    // for number filter and text filter
    filterOoo: 'Filtro...',
    applyFilter: 'Aplicar filtro...',
    // for number filter
    equals: 'daEquals',
    notEqual: 'daNotEquals',
    lessThanOrEqual: 'daLessThanOrEqual',
    greaterThanOrEqual: 'daGreaterThanOrEqual',
    inRange: 'Rango de',
    lessThan: 'Menos a',
    greaterThan: 'Mayor a',
    // for text filter
    contains: 'Contiene',
    startsWith: 'Comieza con',
    endsWith: 'Termina con',
    // the header of the default group column
    group: 'Grupo',
    // tool panel
    columns: 'Columnas',
    rowGroupColumns: 'laPivot Cols',
    rowGroupColumnsEmptyMessage: 'la please drag cols to group',
    valueColumns: 'laValue Cols',
    pivotMode: 'Mis columnas',
    groups: 'Grupos',
    values: 'Valores',
    pivots: 'Pivots',
    valueColumnsEmptyMessage: 'la drag cols to aggregate',
    pivotColumnsEmptyMessage: 'la drag here to pivot',
    // other
    noRowsToShow: 'No se han encontrado resultados para la búsqueda.',
    // enterprise menu
    pinColumn: 'Inmovilizar Columna',
    valueAggregation: 'laValue Agg',
    autosizeThiscolumn: 'Ajustar Ancho',
    autosizeAllColumns: 'Ajustar Todas',
    groupBy: 'laGroup by',
    ungroupBy: 'laUnGroup by',
    resetColumns: 'Restablecer Columnas',
    expandAll: 'laOpen-em-up',
    collapseAll: 'laClose-em-up',
    toolPanel: 'laTool Panelo',
    export: 'Exportar',
    csvExport: 'Exportar a CSV',
    excelExport: 'Exportar a Excel',
    // enterprise menu pinning
    pinLeft: 'Inmovilizar a la izquierda <<',
    pinRight: 'Inmovilizar a la derecha >>',
    noPin: 'No Inmovilizar <>',
    // enterprise menu aggregation and status bar
    sum: 'Suma',
    min: 'Min',
    max: 'Max',
    none: 'laNone',
    count: 'laCount',
    average: 'laAverage',
    // standard menu
    copy: 'Copiar',
    ctrlC: 'Ctrl + C',
    paste: 'Pegar',
    ctrlV: 'Ctrl + V',
    copyWithHeaders: 'Copiar con Encabezados',
  },
  agGridRowStyle(params: any) {
    if (params.node.rowIndex % 2 === 0) {
      return { background: '#F7FAFC' };
    }
  },
  IsValidJson(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
  getBaseUri(): string {
    const serverUri = process.env.VUE_APP_SERVER_URI;
    return serverUri;
  },
  getBaseUrl(): string {
    const baseUrl = process.env.BASE_URL;
    return baseUrl;
  },
  getClienteSesion(): number {
    var cliente = localStorage.getItem('clienteDefecto');
    if (cliente != null) {
      return parseInt(cliente);
    }
    return 0;
  },
  getValorCelda(grid: any, idItemEntidad: number, nombreColumna: string) {
    if (grid != undefined) {
      let item: any = null;
      let res: any = '';

      grid.forEachNode(function(rowNode: any, index: number) {
        if (idItemEntidad == rowNode.data.id) {
          item = rowNode.data;
          return true;
        }
      });
      if (item != null) {
        res = item[nombreColumna];
      }
      return res;
    }
    return '';
  },
  returnGrillaCeldasDesasociar(grid: any, headerNombre: string) {
    for (let i = 0; i <= grid.length - 1; i++) {
      if (grid[i].headerName === headerNombre) {
        grid.splice(i, 1);
        break;
      }
    }
    return grid;
  },
  chequeaPermisosTabs(funcionalidad: number, clienteId: number): boolean {
    try {
      if (store.state.user.permisosUsuario != undefined) {
        let funcionalidadPorcliente = store.state.user.permisosUsuario.filter(
          (x: any) =>
            x.clienteId === clienteId && x.moduloCodigo === funcionalidad
        );

        if (funcionalidadPorcliente.length > 0) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } catch {
      return true;
    }
  },
  createInfoWindow(data: RepetirDiaVm, vehiculoId: number): string {
    let formatFecha = moment(data.fechaActividad, 'YYYY-MM-DDTHH:mm:ss').format(
      'DD/MM/YYYY HH:mm:ss'
    );
    let ubicacion: string =
      data.ubicacion !== undefined ? data.ubicacion.substring(0, 65) : '';

    let tableId = '<table id="vvvTable' + data.id + '">';

    //Icono Transmitiendo
    let triconoTransmitiendo =
      data.transmitiendo === true
        ? '<td style="width:20%;text-align:center;"><i title="En Línea" class="material-icons" style="color:#6eb812"><i class="material-icons" style="font-size: 35px">signal_wifi_4_bar</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Fuera de Línea" class="material-icons" style="color:red"><i class="material-icons" style="font-size: 35px">signal_wifi_off</i></i></td>';
    //Icono Ignicion (1 = True; 0 = False)
    let triconoIgnicion =
      Number(data.ignicion) === 1
        ? '<td style="width:20%;text-align:center;"><i title="Encendido" class="material-icons" style="color:green"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Apagado" class="material-icons" style="color:#27488e"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>';
    //Tabla
    let contentString =
      tableId +
      '  <tr> ' +
      triconoTransmitiendo +
      '    <td style="width:80%"> ' +
      '    	    <span style="font-weight: bold;font-size:13px">' +
      `${data.unidad} ${
        data.nombreConductor !== null &&
        data.nombreConductor !== undefined &&
        data.nombreConductor.trim().replace('Default', '') !== ''
          ? '-'
          : ''
      } ${(data.nombreConductor || '').trim().replace('Default', '')}` +
      '</span> <br><br> ' +
      '         <span style="font-size:12px">' +
      `${(data.ubicacion || '').length > 65 ? ubicacion + '...' : ubicacion}` +
      '</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '  <tr> ' +
      triconoIgnicion +
      '    <td style="width:80%"> ' +
      '         <span style="font-size:12px">' +
      `${formatFecha}` +
      '  |  ' +
      `${data.velocidadActual}` +
      ' Km/h</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '</table> ';

    return contentString;
  },
  createInfoWindowVerDetNuevo(data: RepetirDia, vehiculoId: number): string {
    let formatFecha = data.fechaRecepcion.format('DD/MM/YYYY HH:mm:ss');
    let ubicacion: string =
      data.ubicacion !== undefined ? data.ubicacion.substring(0, 65) : '';

    let tableId = '<table id="vvvTableVerDet' + data.id + '">';

    //Icono Transmitiendo
    let triconoTransmitiendo =
      data.transmitiendo === true
        ? '<td style="width:20%;text-align:center;"><i title="En Línea" class="material-icons" style="color:#6eb812"><i class="material-icons" style="font-size: 35px">signal_wifi_4_bar</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Fuera de Línea" class="material-icons" style="color:red"><i class="material-icons" style="font-size: 35px">signal_wifi_off</i></i></td>';
    //Icono Ignicion (1 = True; 0 = False)
    let triconoIgnicion =
      Number(data.ignicion) === 1
        ? '<td style="width:20%;text-align:center;"><i title="Encendido" class="material-icons" style="color:green"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Apagado" class="material-icons" style="color:#27488e"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>';
    //Tabla
    let contentString =
      tableId +
      '  <tr> ' +
      triconoTransmitiendo +
      '    <td style="width:80%"> ' +
      '    	    <span style="font-weight: bold;font-size:13px">' +
      `${data.unidad} ${
        data.nombreConductor !== null &&
        data.nombreConductor !== undefined &&
        data.nombreConductor.trim().replace('Default', '') !== ''
          ? '-'
          : ''
      } ${(data.nombreConductor || '').trim().replace('Default', '')}` +
      '</span> <br><br> ' +
      '         <span style="font-size:12px">' +
      `${(data.ubicacion || '').length > 65 ? ubicacion + '...' : ubicacion}` +
      '</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '  <tr> ' +
      triconoIgnicion +
      '    <td style="width:80%"> ' +
      '         <span style="font-size:12px">' +
      `${formatFecha}` +
      '  |  ' +
      `${data.velocidadActual}` +
      ' Km/h</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '</table> ';

    return contentString;
  },
  createInfoWindowVerDet(data: RepetirDiaVm, vehiculoId: number): string {
    let fecha = data.fechaRecepcion;
    let formatFecha = moment(String(fecha)).format('DD/MM/YYYY HH:mm:ss');
    let ubicacion: string =
      data.ubicacion !== undefined ? data.ubicacion.substring(0, 65) : '';

    let tableId = '<table id="vvvTableVerDet' + data.id + '">';

    //Icono Transmitiendo
    let triconoTransmitiendo =
      data.transmitiendo === true
        ? '<td style="width:20%;text-align:center;"><i title="En Línea" class="material-icons" style="color:#6eb812"><i class="material-icons" style="font-size: 35px">signal_wifi_4_bar</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Fuera de Línea" class="material-icons" style="color:red"><i class="material-icons" style="font-size: 35px">signal_wifi_off</i></i></td>';
    //Icono Ignicion (1 = True; 0 = False)
    let triconoIgnicion =
      Number(data.ignicion) === 1
        ? '<td style="width:20%;text-align:center;"><i title="Encendido" class="material-icons" style="color:green"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>'
        : '<td style="width:20%;text-align:center;"><i title="Apagado" class="material-icons" style="color:#27488e"><i class="material-icons" style="font-size: 20px">vpn_key</i></i></td>';
    //Tabla
    let contentString =
      tableId +
      '  <tr> ' +
      triconoTransmitiendo +
      '    <td style="width:80%"> ' +
      '    	    <span style="font-weight: bold;font-size:13px">' +
      `${data.unidad} ${
        data.nombreConductor !== null &&
        data.nombreConductor !== undefined &&
        data.nombreConductor.trim().replace('Default', '') !== ''
          ? '-'
          : ''
      } ${(data.nombreConductor || '').trim().replace('Default', '')}` +
      '</span> <br><br> ' +
      '         <span style="font-size:12px">' +
      `${(data.ubicacion || '').length > 65 ? ubicacion + '...' : ubicacion}` +
      '</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '  <tr> ' +
      triconoIgnicion +
      '    <td style="width:80%"> ' +
      '         <span style="font-size:12px">' +
      `${formatFecha}` +
      '  |  ' +
      `${data.velocidadActual}` +
      ' Km/h</span> ' +
      '    </td> ' +
      '  </tr> ' +
      '</table> ';

    return contentString;
  },
  createInfoWindowZona(data: InfoZonaVm): string {
    let tableId =
      '<table id="vvvTableZonas' + data.id + '" style="min-width:100px;">';
    let tipo =
      data.tipoalcance === TipoLugarAlcance.Cliente
        ? data.tipo
        : 'Lugar de Interés';
    let contentString = '';
    if (data.tipoalcance === TipoLugarAlcance.Cliente) {
      contentString =
        tableId +
        '  <tr style="background-color:#27488E;"> ' +
        '    <td colspan="3" align="center" style="width:100%;" nowrap><span style="font-weight: bold;font-size:13px; color:white;">' +
        `${data.nombre}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3" style="width:100%;" nowrap><span style="font-weight: bold;font-size:11px;">' +
        `${data.tipo}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td style="width:40%" nowrap><span style="font-weight: bold;font-size:11px">Grupo de Zona</span></td>' +
        '    <td style="width:10%">:</td>' +
        '    <td style="width:50%"nowrap> ' +
        '        <span style="font-size:11px">' +
        `${data.tipolugar}` +
        '</span></td>' +
        '    </td> ' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3">&nbsp;</td>' +
        '  </tr> ' +
        '</table> ';
    } else {
      contentString =
        tableId +
        '  <tr style="background-color:#27488E;"> ' +
        '    <td colspan="3" align="center" style="width:100%;" nowrap><span style="font-weight: bold;font-size:13px; color:white;">' +
        `${data.tipolugar}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3" style="width:100%;" nowrap><span style="font-weight: bold;font-size:11px;">' +
        `${data.nombre}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3">&nbsp;</td>' +
        '  </tr> ' +
        '</table> ';
    }
    return contentString;
  },
  createInfoWindowFundo(data: InfoZonaVm, tarifa: any): string {
    let tableId =
      '<table id="vvvTableZonas' + data.id + '" style="min-width:100px;">';
    let tipo =
      data.tipoalcance === TipoLugarAlcance.Cliente
        ? data.tipo
        : 'Lugar de Interés';
    let contentString = '';
    if (data.tipoalcance === TipoLugarAlcance.Cliente) {
      contentString =
        tableId +
        '  <tr style="background-color:#27488E;"> ' +
        '    <td colspan="3" align="center" style="width:100%;" nowrap><span style="font-weight: bold;font-size:13px; color:white;">' +
        `${data.nombre}` +
        '  </tr> ' +
        '  <tr> ' +
        '    <td style="width:40%" nowrap><span style="font-weight: bold;font-size:11px">Tarifa</span></td>' +
        '    <td style="width:10%">:</td>' +
        '    <td style="width:50%"nowrap> ' +
        '        <span style="font-size:11px">' +
        //// Mostrar tarifas solo para fundo tipositiocliente == "8"
        'Planta Talca: ' +
        `${
          tarifa.tarifaTalca != undefined
            ? '$' + tarifa.tarifaTalca
            : 'Sin datos'
        }` +
        '<br/> Planta Quinta:' +
        `${
          tarifa.tarifaQuinta != undefined
            ? '$' + tarifa.tarifaQuinta
            : 'Sin datos'
        }` +
        '</span></td>' +
        '    </td> ' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3">&nbsp;</td>' +
        '  </tr> ' +
        '</table> ';
    } else {
      contentString =
        tableId +
        '  <tr style="background-color:#27488E;"> ' +
        '    <td colspan="3" align="center" style="width:100%;" nowrap><span style="font-weight: bold;font-size:13px; color:white;">' +
        `${data.tipolugar}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3" style="width:100%;" nowrap><span style="font-weight: bold;font-size:11px;">' +
        `${data.nombre}` +
        '</span></td>' +
        '  </tr> ' +
        '  <tr> ' +
        '    <td colspan="3">&nbsp;</td>' +
        '  </tr> ' +
        '</table> ';
    }
    return contentString;
  },
  createInfoWindowZonaDiv(data: InfoZonaVm): string {
    let tableId = '<div class="iw-container">';
    let tipo =
      data.tipoalcance === TipoLugarAlcance.Cliente
        ? data.tipo
        : 'Lugar de Interés';
    var contentString =
      '<div id="content">' +
      '<div style="background-color: #27488E;text-align: center">' +
      '<h3 style="color: #FFFFFF">&nbsp' +
      `${data.nombre}` +
      '&nbsp</h3>' +
      '</div>' +
      '<div id="bodyContent">' +
      '<p>' +
      `${data.tipolugar}` +
      '</p>' +
      '</div>' +
      '</div>';

    return contentString;
  },
  getIconoMarker(estado: EstadoTransmision, orientacion: number = 0) {
    let icono: object = null;
    switch (estado) {
      case EstadoTransmision.Transmitiendo:
        icono = {
          url: marcadorGreen,
          scaledSize: new google.maps.Size(41, 41),
          fillOpacity: 1,
          strokeColor: '#2D2D2D',
          strokeWeight: 1,
        };
        break;
      case EstadoTransmision.SinTransmitir:
        icono = {
          url: marcadorRed,
          scaledSize: new google.maps.Size(41, 41),
          fillOpacity: 1,
          strokeColor: '#2D2D2D',
          strokeWeight: 1,
        };
        break;
      case EstadoTransmision.Seleccionado:
        icono = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#27488e',
          fillOpacity: 1,
          strokeWeight: 0,
          anchor: new google.maps.Point(0, -3),
          rotation: orientacion,
        };
        break;
      case EstadoTransmision.VelocidadExcedida:
        icono = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3.5, //tamaño
          strokeColor: '#f00', //color del borde
          strokeWeight: 0, //grosor del borde
          fillColor: '#FF0101', //color de relleno
          fillOpacity: 1, // opacidad del relleno
          rotation: orientacion, //orientacion
        };
        break;
      case EstadoTransmision.SinVelocidadExcedida:
        icono = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4.5, //tamaño
          strokeColor: '#000000', //color del borde
          strokeWeight: 2, //grosor del borde
          fillColor: '#018001', //color de relleno
          fillOpacity: 1, // opacidad del relleno
          rotation: orientacion, //orientacion
        };
        break;
      case EstadoTransmision.RutaProvisoria:
        icono = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4.5, //tamaño
          // strokeColor: '#000000', //color del borde
          strokeColor: '#FFFFFF',
          strokeWeight: 2, //grosor del borde
          // fillColor: '#018001', //color de relleno
          fillColor: '#8e8e8e', //color de relleno
          fillOpacity: 1, // opacidad del relleno
          rotation: orientacion, //orientacion
        };
        break;
      default:
        icono = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 12, //tamaño
          strokeColor: '#000000', //color del borde
          strokeWeight: 0, //grosor del borde
          fillColor: '#018001', //color de relleno
          fillOpacity: 1, // opacidad del relleno
        };

        break;
    }
    return icono;
  },
  getWidth(texto: string): number {
    let pixporletra = 13;
    let cantletras = texto.length;
    return (cantletras + 3) * pixporletra;
  },
  crearArchivoCsv(filename: string, rows: object[], columnDefs: ColDef[]) {
    if (!rows || !rows.length) {
      return;
    }

    const separator = ',';
    const keysCabecera = Object.keys(rows[0]);

    //cabecera
    const keys: any = [];
    const cabecera: any = [];
    const columns = columnDefs;
    columns.forEach((item: any) => {
      let cab = keysCabecera.find((x: any) => x === item.field);
      if (cab !== undefined && cab !== null) {
        if (item.field === 'esCompartido') {
          cabecera.push('Compartido');
          keys.push(item.field);
        } else if (item.headerName !== 'Acciones') {
          cabecera.push(item.headerName);
          keys.push(item.field);
        }
      }
    });
    //---

    //contenido
    const csvContent =
      cabecera.join(separator) +
      '\n' +
      rows
        .map((row: any) => {
          return keys
            .map((k: any) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];

              //Campo Tipo Estado
              if (k === 'estado') {
                if (cell === EstadoEntidad.Sistema)
                  cell = EstadoEntidad[EstadoEntidad.Activo];
                else cell = EstadoEntidad[cell];
              }
              //---

              //Campo Tipo Estado Aceptar/Compartirn Información
              if (k === 'estadoCompartirInformacion') {
                if (filename === 'AceptarInformación.csv')
                  cell = EstadoAceptarInformacion[cell];
                else cell = EstadoCompartirInformacion[cell];
              }
              //---

              //Campos Tipo Fecha
              if (
                k === 'fechaCreacion' ||
                k === 'fechaModificacion' ||
                //k === 'fechaNacimiento' ||
                k === 'fechaCompartio' ||
                k === 'fechaAcepto' ||
                k === 'fechaCaducidad' ||
                k === 'fechaAceptacion' ||
                k === 'fechaInicioAsociacion' ||
                k === 'fechaFinAsociacion' ||
                k === 'fechaInicio' ||
                k === 'fechaTermino' ||
                k === 'fechaIni' ||
                k === 'fechaFin' ||
                k === 'ultimoEnvio'
              ) {
                if (cell.length > 0 || cell instanceof moment) {
                  cell = moment(cell).format('DD/MM/YYYY');
                }
              }
              //---

              //Campo Tipo Rol
              if (k === 'tipo') {
                cell = TipoRol[cell];
              }
              //---

              //Tipo Geometría
              if (k === 'tipoGeometria') {
                cell = TipoGeometria[cell];
              }
              //---

              //Formato Json
              if (k === 'formaJson') {
                cell = cell.replace(/;/g, ':');
              }
              //---

              //Campo Tipo SIM
              if (k === 'tipoSim') {
                cell = TipoSim[cell];
              }
              //---

              //Campo Es Compartido (Vehículos)
              if (k === 'esCompartido') {
                if (cell === true) cell = 'Si';
                else cell = 'No';
              }
              //---

              //Campo Tipo Nombre
              if (k === 'nombre') {
                cell = row['nombre'];
                if (
                  row['apellidoPaterno'] !== null &&
                  row['apellidoPaterno'] !== undefined
                ) {
                  cell = cell + ' ' + row['apellidoPaterno'];
                }
                if (
                  row['apellidoMaterno'] !== null &&
                  row['apellidoMaterno'] !== undefined
                ) {
                  cell = cell + ' ' + row['apellidoMaterno'];
                }
              }
              //---

              return cell;
            })
            .join(separator);
        })
        .join('\n');
    //---

    //ARCHIVO
    var csvData = '\ufeff' + csvContent;
    var blob = new Blob([csvData], {
      type: 'application/csv;charset=utf-8;',
    });

    if (window.navigator.msSaveBlob) {
      // FOR IE BROWSER
      navigator.msSaveBlob(blob, filename);
    } else {
      // FOR OTHER BROWSERS
      var link = document.createElement('a');
      var csvUrl = URL.createObjectURL(blob);
      link.href = csvUrl;
      link.style.visibility = 'hidden';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    //FIN

    /*//archivo
    if (window.navigator.msSaveOrOpenBlob) {
      //Edge
      var csvString = '\ufeff' + csvContent;
      var blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      //Otros Navegadores
      const link = document.createElement('a');
      if (link.download !== undefined) {
        link.setAttribute(
          'href',
          'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvContent)
        );
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    //---*/
  },
  largoTextoAsociacion(texto: string): string {
    //Nombres en los ComboBox de Asociaciones
    let largo = 40; //(texto === texto.toUpperCase()) ? 52 : 59;

    if (texto.length > largo) return texto.substring(0, largo) + '...';
    else return texto;
  },
  caseInsensitiveSort(
    valueA: any,
    valueB: any,
    nodeA: any,
    nodeB: any,
    isInverted: any
  ) {
    valueA = valueA === null || valueA === undefined ? '' : valueA;
    valueB = valueB === null || valueB === undefined ? '' : valueB;
    return valueA
      .toLowerCase()
      .localeCompare(valueB.toLowerCase(), 'es', { numeric: true });
    //return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
  },
  caseNumberSort(
    valueA: any,
    valueB: any,
    nodeA: any,
    nodeB: any,
    isInverted: any
  ) {
    valueA = valueA === null || valueA === undefined ? '0' : valueA;
    valueB = valueB === null || valueB === undefined ? '0' : valueB;
    return parseInt(valueA) - parseInt(valueB);
  },
};
