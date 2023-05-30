import {} from 'googlemaps';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';
import { AxiosVue } from '@/AxiosVue';
import { ServicioProxy, EstadoTransmision } from '@/config/enums';
import { RepetirDiaRequestVm } from '@/interfaces/RepetirDiaRequestVm';
import config from '@/config/index';

export class RepetirDiaComportamiento {
  controllerRepetirDia: string = 'repetirDia';
  infoWindows: google.maps.InfoWindow[] = [];
  actividadesRepetirDia: Array<RepetirDiaVm> = [];
  wayPoints: google.maps.LatLng[] = [];
  rutaRepetirDia: google.maps.Polyline = new google.maps.Polyline();
  repetirDiaMarker: google.maps.Marker[] = [];
  axiosVehiculo: AxiosVue = new AxiosVue(ServicioProxy.Vehiculo);
  reproducirRepetirDia: boolean = true;
  repeticionInterval: NodeJS.Timeout;
  contadorInicialRepetirDia: number = 0;
  contadorFinalRepetirDia: number = 0;

  // slider tiempo
  intervalosRepetirDia: number[] = [0.5, 1.0, 1.5];
  invervaloRepetirDiaSeleccionado: number = 1.0;

  constructor(public map: google.maps.Map, public vehiculoId: number) {}

  dibujarRutaCompleta(): void {
    const wayPointsRutaCompleta: google.maps.LatLng[] = this.actividadesRepetirDia.map(
      actividad => {
        return new google.maps.LatLng(actividad.latitud, actividad.longitud);
      }
    );

    const lineSymbol: google.maps.Symbol = {
      strokeOpacity: 1,
      scale: 4,
      path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
    };

    const polylineOptions: google.maps.PolylineOptions = {
      path: wayPointsRutaCompleta,
      geodesic: true,
      strokeColor: '#FF0000',
      icons: [
        {
          icon: lineSymbol,
          offset: '0',
          repeat: '20px',
        },
      ],
      strokeOpacity: 0,
    };

    this.rutaRepetirDia.setOptions(polylineOptions);
    this.rutaRepetirDia.setMap(this.map);
  }

  buscarRepetirDia(vm: RepetirDiaRequestVm): void {
    this.axiosVehiculo.http
      .get(this.controllerRepetirDia, {
        params: vm,
      })
      .then(response => {
        this.actividadesRepetirDia = response.data;
      });
  }

  iniciarRepetirDia(): void {
    if (this.reproducirRepetirDia) {
      if (this.actividadesRepetirDia.length > 0) {
        const tiempoIntervalo: number = this.intervalosRepetirDia[
          this.invervaloRepetirDiaSeleccionado
        ];

        this.repeticionInterval = setInterval(() => {
          this.avanzarRepetirDia();
        }, tiempoIntervalo * 1000);

        this.reproducirRepetirDia = false;
      }
    } else {
      if (
        this.repeticionInterval !== undefined &&
        this.repeticionInterval !== null
      ) {
        clearInterval(this.repeticionInterval);
      }
      this.reproducirRepetirDia = true;
    }
  }

  avanzarRepetirDia(): void {
    if (this.actividadesRepetirDia.length > 0) {
      this.contadorFinalRepetirDia += 1;
      this.dibujarRepetirDia(
        this.contadorInicialRepetirDia,
        this.contadorFinalRepetirDia
      );
      this.contadorInicialRepetirDia += 1;
    }
  }

  retrocederRepetirDia(): void {
    if (this.wayPoints.length > 0) {
      this.wayPoints.pop();
      this.wayPoints.pop();

      this.contadorInicialRepetirDia =
        this.contadorInicialRepetirDia - 1 < 0
          ? 0
          : this.contadorInicialRepetirDia - 1;
      this.contadorFinalRepetirDia =
        this.contadorFinalRepetirDia - 1 < 0
          ? 0
          : this.contadorFinalRepetirDia - 1;

      const polylineOptions: google.maps.PolylineOptions = {
        path: this.wayPoints,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      };

      this.rutaRepetirDia.setOptions(polylineOptions);
      this.rutaRepetirDia.setMap(this.map);
    }
  }

  dibujarRepetirDia(indiceInicial: number, indiceFinal: number): void {
    if (this.actividadesRepetirDia.length > 0) {
      const actividadInicial: RepetirDiaVm = this.actividadesRepetirDia[
        indiceInicial
      ];
      const actividadFinal: RepetirDiaVm = this.actividadesRepetirDia[
        indiceFinal
      ];

      const posicionInicialLatLng: google.maps.LatLng = new google.maps.LatLng(
        actividadInicial.latitud,
        actividadInicial.longitud
      );

      const posicionFinalLatLng: google.maps.LatLng = new google.maps.LatLng(
        actividadFinal.latitud,
        actividadFinal.longitud
      );

      this.wayPoints.push(posicionInicialLatLng);
      this.wayPoints.push(posicionFinalLatLng);

      const polylineOptions: google.maps.PolylineOptions = {
        path: this.wayPoints,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
      };

      this.rutaRepetirDia.setOptions(polylineOptions);
      this.rutaRepetirDia.setMap(this.map);
    }
  }

  //   agregarMarkerRepetirDia(): void {
  //     for (let i: number = 0; i < this.actividadesRepetirDia.length; i++) {
  //       const actividad: RepetirDiaVm = this.actividadesRepetirDia[i];

  //       // @ts-ignore
  //       let repetirDiaMarker: any = new google.maps.Marker({
  //         // tipoLugarId: capa.tipoLugarId,
  //         vehiculoId: this.vehiculoId,
  //         transmitiendo: actividad.transmitiendo,
  //         position: { lat: actividad.latitud, lng: actividad.longitud },
  //         map: this.map,
  //         icon: config.getIconoMarker(EstadoTransmision.SinTransmitir),
  //         title: ""
  //       });

  //       const infowindow:google.maps.InfoWindow = new google.maps.InfoWindow({
  //         content: config.createInfoWindow(actividad, this.vehiculoId),
  //         maxWidth: 300
  //       });

  //       google.maps.event.addListener(infowindow, "domready", () => {
  //         this.createInfoWindowBtn(this.vehiculoId, actividad.ignicion);
  //       });

  //       repetirDiaMarker.addListener("click", () => {
  //         //borra infoWindows existentes
  //         this.infoWindows.forEach((infoWin: google.maps.InfoWindow) => {
  //           infoWin.close();
  //         });

  //         infowindow.open(this.map, repetirDiaMarker);
  //         this.infoWindows.push(infowindow);
  //       });
  //     }
  //   }

  createInfoWindowBtn(
    vehiculoId: number,
    ignicionEncendida: boolean = false
  ): HTMLAnchorElement {
    const existButton: HTMLElement = document.getElementById(
      'btnVerDetalle' + vehiculoId
    );

    if (existButton === null) {
      let color: string = ignicionEncendida ? 'green' : 'red';

      var iIgn: HTMLElement = document.createElement('i');
      iIgn.setAttribute('class', 'material-icons');
      iIgn.setAttribute('title', 'Transmitiendo');
      iIgn.setAttribute('class', 'material-icons');
      iIgn.style.display = 'flex';
      iIgn.style.color = color;
      iIgn.innerText = 'vpn_key';

      var eButton: HTMLAnchorElement = document.createElement('a');
      eButton.setAttribute('id', 'btnVerDetalle' + vehiculoId);
      eButton.innerText = 'Ver Detalle >';

      eButton.addEventListener('click', () => {
        this.verDetalleVehiculo();
      });

      let table: HTMLTableElement = document.getElementById(
        'vvvTable' + vehiculoId
      ) as HTMLTableElement;
      var row: HTMLTableRowElement = table.insertRow(1);
      var cell1: HTMLTableDataCellElement = row.insertCell(0);
      var cell2: HTMLTableDataCellElement = row.insertCell(1);

      cell1.innerHTML = '';
      cell2.setAttribute('align', 'left');
      cell2.appendChild(iIgn);
      var txt: Text = document.createTextNode(
        ignicionEncendida ? 'Ignición Encendida' : 'Ignición Apagada'
      );

      cell2.appendChild(txt);

      var _row: HTMLTableRowElement = table.insertRow(2);
      var _cell1: HTMLTableDataCellElement = _row.insertCell(0);
      var _cell2: HTMLTableDataCellElement = _row.insertCell(1);

      _cell1.innerHTML = '';
      _cell2.setAttribute('align', 'right');
      _cell2.appendChild(eButton);

      return eButton;
    }
  }

  verDetalleVehiculo(): void {
    alert('En construcción...');
  }
}
