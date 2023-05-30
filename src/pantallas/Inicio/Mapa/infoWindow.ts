import { truncate } from 'lodash';

import { Vehiculo } from '@/pantallas/Inicio/VehiculosData/fetchVehiculos';
import { Actividad } from '@/pantallas/Inicio/ActividadesData/fetchActividades';

export const createInfoWindowContent = (vehiculo: Vehiculo) => {
  const crearIconoTransmitiendo = () => {
    const { transmitiendo } = vehiculo.ultimaActividad;
    const outer = transmitiendo
      ? `<i class="material-icons" title="En línea" style="color:#6eb812">`
      : `<i class="material-icons" title="Fuera de Línea" style="color:red">`;
    return `
    ${outer}
      <i class="material-icons" style="font-size: 35px">${
        transmitiendo ? 'signal_wifi_4_bar' : 'signal_wifi_off'
      }</i>
    </i>
    `;
  };
  const crearIconoIgnicion = () => {
    const outer = vehiculo.ultimaActividad.ignicion
      ? '<i title="Encendido" class="material-icons" style="color:green">'
      : '<i title="Apagado" class="material-icons" style="color:#27488e">';
    return `
    ${outer}
      <i class="material-icons" style="font-size: 20px">vpn_key</i>
    </i>
    `;
  };
  const {
    ultimaActividad: { fechaRecepcion, ubicacion, velocidadActual },
  } = vehiculo;
  const fechaFormateadaSegura = fechaRecepcion.isValid()
    ? fechaRecepcion.format('DD/MM/YYYY HH:mm:ss')
    : '';
  const velocidadFormateadaSegura = isNaN(velocidadActual)
    ? ''
    : `  |  ${velocidadActual} Km/h`;

  return `
  <table id="vvvTable${vehiculo.id}">
    <tr>
      <td style="width:20%;text-align:center;">
        ${crearIconoTransmitiendo()}
      </td>
      <td style="width:80%">
        <span style="font-weight: bold;font-size:13px">
          ${vehiculo.unidad} - ${vehiculo.nombreConductor}
        </span>
        <br><br>
        <span style="font-size:12px">
          ${truncate(ubicacion, {
            length: 65,
          })}
        </span>
      </td>
    </tr>
    <tr>
      <td style="width:20%;text-align:center;">
        ${crearIconoIgnicion()}
      </td>
      <td style="width:80%">
        <span style="font-size:12px">
          ${fechaFormateadaSegura + velocidadFormateadaSegura}
        </span>
      </td>
    </tr>
  </table>
  `;
};

export const createInfoWindowContentActividad = (actividad: Actividad) => {
  const crearIconoTransmitiendo = () => {
    const { transmitiendo } = actividad;
    const outer = actividad.transmitiendo
      ? `<i class="material-icons" title="En línea" style="color:#6eb812">`
      : `<i class="material-icons" title="Fuera de Línea" style="color:red">`;
    return `
    ${outer}
      <i class="material-icons" style="font-size: 35px">${
        transmitiendo ? 'signal_wifi_4_bar' : 'signal_wifi_off'
      }</i>
    </i>
    `;
  };
  const crearIconoIgnicion = () => {
    const outer = actividad.ignicion
      ? '<i title="Encendido" class="material-icons" style="color:green">'
      : '<i title="Apagado" class="material-icons" style="color:#27488e">';
    return `
    ${outer}
      <i class="material-icons" style="font-size: 20px">vpn_key</i>
    </i>
    `;
  };

  const fechaFormateadaSegura = actividad.fechaActividad.isValid()
    ? actividad.fechaActividad.format('DD/MM/YYYY HH:mm:ss')
    : '';
  const velocidadFormateadaSegura = isNaN(actividad.velocidadActual)
    ? ''
    : `  |  ${actividad.velocidadActual} Km/h`;

  return `
  <table id="vvvTable${actividad.vehiculoId}">
    <tr>
      <td style="width:20%;text-align:center;">
        ${crearIconoTransmitiendo()}
      </td>
      <td style="width:80%">
        <span style="font-weight: bold;font-size:13px">
          ${actividad.unidad} - ${actividad.nombreConductor}
        </span>
        <br><br>
        <span style="font-size:12px">
          ${truncate(actividad.ubicacion, {
            length: 65,
          })}
        </span>
      </td>
    </tr>
    <tr>
      <td style="width:20%;text-align:center;">
        ${crearIconoIgnicion()}
      </td>
      <td style="width:80%">
        <span style="font-size:12px">
          ${fechaFormateadaSegura + velocidadFormateadaSegura}
        </span>
      </td>
    </tr>
  </table>
  `;
};
