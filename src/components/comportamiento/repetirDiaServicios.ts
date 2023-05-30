import axios from 'axios';
import config from '@/config/index';
import { EstadoTransmision } from '@/config/enums';
import store from '@/store';
import { RepetirDiaVm } from '@/interfaces/RepetirDiaVm';
import apiGoogleMapsConfig from '../../config/apiGoogleMaps';
import {} from 'googlemaps';
declare var google: any;

export default class RepetirDiaFuncionalidades {
  //#region Declaraciones variables y objetos
  apiConfig: apiGoogleMapsConfig = new apiGoogleMapsConfig();
  keyMap: string = this.apiConfig.getKeyMap();
  apiSnapRoad: string = this.apiConfig.getUrlPointSnapRoads();

  strokeColorLineaRecorrida: string = '#27488e';
  strokeColorLineaRecorrer: string = '#637082';

  icono: string = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';

  colorMarcadorPosicionFin: string = '#ffe800';
  marcadores: any = [];
  velocidadExcedidafillColor: string = '#FF0101'; //color de relleno flecha posicion velocidad excedida
  //#endregion

  //#region Metodos

  async busquedaYDespliegueRuta(
    obj: any,
    muestraFlechasActividadDetalle: boolean = false
  ) {
    if (this.marcadores !== undefined) {
      this.marcadores.forEach((item: any) => {
        item.marcador.setMap(null);
      });
      this.marcadores = [];
    }
    if (
      obj.primeraCarga === false ||
      obj.primeraCarga === undefined ||
      obj.nombreComponente === 'mapts'
    ) {
      obj.markerFlechasShow = false;
      obj.rutasResponseSTR = [];
      obj.actividadesRespuestaSnap = [];
      obj.tramosActividadCoordenadas = [];
      obj.btnAtrasEnabled = true;
      obj.btnSiguienteEnabled = false;
    }

    if (obj.generaRuta) {
      await this.runSnapToRoad(obj, obj.actividadesRepetirDia);
      obj.rutasResponseSTR.forEach((items: any) => {
        obj.tramosActividadCoordenadas.push(
          this.generaTramosAPintar({
            envio: items.envio,
            respuesta: items.respuesta,
          })
        );
      });
      await this.drawSnappedPolyline(obj, obj.tramosActividadCoordenadas);
    }

    switch (obj.nombreComponente) {
      case 'mapts':
        await this.dibujaFlechasOrientacionAll(obj, obj.actividadesRepetirDia);
        if (obj.actividadMarkers !== undefined) {
          obj.actividadMarkers.forEach((item: any) => {
            item.marcador.setMap(null);
          });
          obj.actividadMarkers = [];
        }
        obj.actividadMarkers = this.marcadores;
        obj.indexMarcadorRuta = obj.actividadMarkers.length;

        break;
      case 'actividadDetalle':
        await this.dibujaFlechasOrientacionAll(
          obj,
          obj.actividadesRepetirDia,
          false,
          muestraFlechasActividadDetalle
        );
        if (obj.actividadMarkersDetalle !== undefined) {
          if (obj.actividadMarkersDetalle !== undefined) {
            obj.actividadMarkersDetalle.forEach((item: any) => {
              item.marcador.setMap(null);
            });
            obj.actividadMarkersDetalle = [];
          }
          obj.actividadMarkersDetalle = this.marcadores;
          obj.indexMarcadorRuta = obj.actividadMarkersDetalle.length;
        }
        break;
    }

    obj.reproducirRepetirDia = true;
    obj.btnAtrasEnabled = false;
    obj.btnSiguienteEnabled = false;
  }

  async despliegeRutaInferida(obj: any) {
    const rutaParcial: any[] = [];
    obj.actividadesRepetirDia.forEach((item: any, index: any) => {
      if (index <= obj.indexMarcadorRuta) {
        rutaParcial.push(item);
      }
    });

    await this.runSnapToRoad(obj, rutaParcial);
  }

  async runSnapToRoad(obj: any, actividades: any) {
    //obj.loadingService.showLoading(`Generando ruta...`);
    obj.polylinesActividad.forEach((polylines: any) => {
      polylines.polyline.setMap(null);
    });
    obj.polylinesActividad = [];
    var pathValues: any[] = [];
    var pathValuesActividad: any[] = [];
    obj.snappedCoordinates = [];
    let vueltas = actividades.length;

    let i = 0;
    while (i < vueltas) {
      pathValues = [];
      pathValuesActividad = [];
      let rangoActividad = actividades.slice(i, i + 99);

      let x = 0;
      while (x < rangoActividad.length) {
        pathValues.push(
          `${rangoActividad[x].latitud},${rangoActividad[x].longitud}`
        );
        pathValuesActividad.push({
          actividad: rangoActividad[x],
          values: `${rangoActividad[x].latitud},${rangoActividad[x].longitud}`,
        });
        x++;
      }
      const data = await this.completaRuta(pathValues);
      obj.rutasResponseSTR.push({
        envio: pathValuesActividad,
        respuesta: data,
      });
      i += 99;
    }
  }
  completaRuta(pathValues: any) {
    let model = {
      interpolate: true,
      key: this.keyMap,
      //points: pathValues.join('|')// Nearest Road
      path: pathValues.join('|'),
    };
    return new Promise((resolve, reject) => {
      return axios
        .get(this.apiSnapRoad, {
          params: model,
        })
        .then((respuesta: any) => {
          resolve(respuesta);
        })
        .catch((err: any) => {
          console.log('error: ', err);
          reject(err);
        });
    });
  }
  generaTramosAPintar(elemento: any) {
    let pintar: any[] = [];
    let tramos: any[] = [];
    let spointsDevueltos = elemento.respuesta.data.snappedPoints;

    if (spointsDevueltos !== undefined) {
      let cantidadSPoints = spointsDevueltos.length;
      let puntosEnviados = elemento.envio.length;

      if (spointsDevueltos !== undefined) {
        elemento.envio.forEach((item: any, index: any) => {
          let x = 0;
          pintar = [];
          let continua = false;
          let cantOriginalIndex = 0;
          while (x < cantidadSPoints) {
            if (
              index === spointsDevueltos[x].originalIndex ||
              (continua && spointsDevueltos[x].originalIndex === undefined)
            ) {
              if (index !== spointsDevueltos[x].originalIndex) {
                pintar.push(spointsDevueltos[x].location);
              } else {
                pintar.push(spointsDevueltos[x].location);
                cantOriginalIndex++;
              }

              if (elemento.envio.length == cantOriginalIndex) {
                break;
              } else {
                pintar.push(spointsDevueltos[x].location);
              }
              continua = true;
            } else {
              // continua=false;
              if (continua) {
                pintar.push(spointsDevueltos[x].location);
                break;
              }
            }
            x++;
          }
          if (pintar.length > 0) {
            tramos.push({ actividad: item.actividad, tramo: pintar });
          } else {
            pintar.push({
              latitude: item.actividad.latitud,
              longitude: item.actividad.longitud,
            });

            tramos.push({ actividad: item.actividad, tramo: pintar });
          }
        });
      }
    } else {
      elemento.envio.forEach((item: any, index: any) => {
        let locationInicio = {
          latitude: item.actividad.latitud,
          longitude: item.actividad.longitud,
        };
        pintar.push(locationInicio);
        if (elemento.envio[index + 1] !== undefined) {
          let locationFin = {
            latitude: elemento.envio[index + 1].actividad.latitud,
            longitude: elemento.envio[index + 1].actividad.longitud,
          };
          pintar.push(locationFin);
        }
        tramos.push({ actividad: item.actividad, tramo: pintar });
      });
    }
    return tramos;
  }
  procesaPuntosRespuestaSnapToRoad(dataPoints: any) {
    let data = dataPoints;

    let coordenadas: any[] = [];

    data.forEach((tramo: any) => {
      var latlng = new google.maps.LatLng(
        tramo.latitude.toFixed(7).toString(),
        tramo.longitude.toFixed(7).toString()
      );
      coordenadas.push(latlng);
    });
    return coordenadas;
  }
  async drawSnappedPolyline(obj: any, tramos: any) {
    let x = 0;
    tramos.forEach((tramo: any) => {
      if (tramo !== undefined) {
        tramo.forEach((sub: any, index: any) => {
          let tramoProcesado = this.procesaPuntosRespuestaSnapToRoad(sub.tramo);

          var snappedPolyline = new google.maps.Polyline({
            path: tramoProcesado,
            strokeColor: this.strokeColorLineaRecorrida,
            strokeWeight: 3,
          });
          snappedPolyline.setMap(obj.map);
          obj.polylinesActividad.push({
            actividad: tramo.actividad,
            polyline: snappedPolyline,
          });
          x++;
        });
      }
    });
  }
  async dibujaFlechasOrientacionAll(
    obj: any,
    data: any,
    rutaProvisoria: any = false,
    visible: boolean = false
  ) {
    if (!obj.generaRuta) {
      // obj.loadingService.showLoading(`Generando ruta...`);
    }
    data.forEach((actividad: any, index: any) => {
      let visiblePrimero = index === 0 ? true : false;
      if (index === 0) {
        obj.marcadorPosicion = this.creaMarcadorPosicionInicial(actividad);
      } else if (index === data.length - 1) {
        visible = true;
      }
      this.agregarMarkerRepetirDia(
        obj,
        actividad,
        false,
        rutaProvisoria,
        visiblePrimero || visible ? true : false
      );
    });

    if (obj.marcadorPosicion !== undefined && obj.marcadorPosicion !== null)
      obj.marcadorPosicion.setMap(obj.map);
  }
  colorMarker(obj: any, rowIndex: any, next: boolean = false) {
    if (!next) {
      //atras
      const nextRowIndex = rowIndex + 1;

      if (nextRowIndex < this.marcadores.length) {
        const isVelocidadExcedida = this.velocidadMaxima(
          this.marcadores[rowIndex].actividad
        );

        this.marcadores[nextRowIndex].marcador.setIcon(
          config.getIconoMarker(
            EstadoTransmision.RutaProvisoria,
            this.marcadores[nextRowIndex].actividad.orientacion
          )
        );

        this.flechaIndicadoraPosicion(
          obj,
          this.marcadores[rowIndex].actividad,
          rowIndex,
          isVelocidadExcedida
        );
      }
    } else {
      let vExcedida = this.velocidadMaxima(this.marcadores[rowIndex].actividad);
      this.marcadores[rowIndex].marcador.setIcon(
        config.getIconoMarker(
          vExcedida
            ? EstadoTransmision.VelocidadExcedida
            : EstadoTransmision.SinVelocidadExcedida,
          this.marcadores[rowIndex].actividad.orientacion
        )
      );

      this.flechaIndicadoraPosicion(
        obj,
        this.marcadores[rowIndex].actividad,
        rowIndex,
        vExcedida
      );
    }
  }
  velocidadMaxima(actividad: any): any {
    let excesoVelocidad: boolean = false;

    if (
      actividad.velocidadMaxima > 0 &&
      actividad.velocidadActual > actividad.velocidadMaxima
    ) {
      excesoVelocidad = true;
    } else {
      excesoVelocidad = false;
    }
    return excesoVelocidad;
  }
  creaMarcadorPosicionInicial(actividad: any) {
    return new google.maps.Marker({
      position: { lat: actividad.latitud, lng: actividad.longitud },
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: this.strokeColorLineaRecorrida,
        fillOpacity: 1,
        strokeWeight: 0,
        anchor: new google.maps.Point(0, -3),
        rotation: 270,
      },
      title: 'Posición Actual',
      //animation: google.maps.Animation.DROP,
      visible: true,
    });
  }
  flechaIndicadoraPosicion(
    obj: any,
    actividad: any,
    rowIndex: any,
    velocidadExcedida: boolean = false
  ) {
    if (!obj.marcadorPosicion) {
      return;
    }
    obj.marcadorPosicion.setPosition(
      new google.maps.LatLng(actividad.latitud, actividad.longitud)
    );

    //velocidadExcedidafillColor
    if (
      rowIndex === this.marcadores.length - 1 &&
      obj.marcadorPosicion !== undefined
    )
      obj.marcadorPosicion.setIcon({
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: velocidadExcedida
          ? this.velocidadExcedidafillColor
          : this.strokeColorLineaRecorrida,
        fillOpacity: 0.5,
        strokeWeight: 0,
        anchor: new google.maps.Point(0, -3),
        rotation: 270,
      });
    else
      obj.marcadorPosicion.setIcon({
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, //google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: velocidadExcedida
          ? this.velocidadExcedidafillColor
          : this.strokeColorLineaRecorrida,
        fillOpacity: 1,
        strokeWeight: 0,
        anchor: new google.maps.Point(0, -3),
        rotation: 270,
      });
  }
  colorEstiloLinea(obj: any, rowIndex: any, next: boolean = false) {
    if (obj.generaRuta) {
      if (!next) {
        obj.polylinesActividad[rowIndex].polyline.setOptions({
          strokeColor: this.strokeColorLineaRecorrer,
        });
      } else {
        if (rowIndex - 1 >= 0) {
          obj.polylinesActividad[rowIndex - 1].polyline.setOptions({
            strokeColor: this.strokeColorLineaRecorrida,
          });
          if (rowIndex == obj.polylinesActividad.length - 1)
            obj.polylinesActividad[rowIndex].polyline.setOptions({
              strokeColor: this.strokeColorLineaRecorrida,
            });
        }
        if (rowIndex == 0)
          obj.polylinesActividad[rowIndex].polyline.setOptions({
            strokeColor: this.strokeColorLineaRecorrida,
          });
      }
    }
  }

  rutaParcialPorActividad(component: any, actividad: any) {
    this.rutaParcialActividadClick(
      component,
      this.marcadores.findIndex(
        (x: any) => actividad.actividadId === x.actividad.actividadId
      )
    );
  }

  nextPrev(
    obj: any,
    incremento: number,
    next: boolean = false,
    play: boolean = false,
    estableciendoPosicionInicial: boolean = false
  ) {
    if (!estableciendoPosicionInicial) {
      this.markerFlechasVisible(obj, true);
    }
    obj.indexMarcadorRuta += incremento;
    if (
      obj.indexMarcadorRuta >= 0 &&
      obj.indexMarcadorRuta < this.marcadores.length
    ) {
      this.colorMarker(obj, obj.indexMarcadorRuta, next);
      this.colorEstiloLinea(obj, obj.indexMarcadorRuta, next);
      if (!estableciendoPosicionInicial) {
        switch (obj.nombreComponente) {
          case 'mapts':
            store.commit(
              'setActividad',
              this.marcadores[obj.indexMarcadorRuta].actividad
            );
            break;
          case 'actividadDetalle':
            store.commit(
              'setActividadDetalle',
              this.marcadores[obj.indexMarcadorRuta].actividad
            );
            break;
        }
      }
    }
    if (!play) {
      obj.btnAtrasEnabled = obj.indexMarcadorRuta <= 0 ? false : true;
      obj.btnSiguienteEnabled =
        obj.indexMarcadorRuta >= this.marcadores.length - 1 ? false : true;
    }
    obj.indexMarcadorRuta =
      obj.indexMarcadorRuta < 0 ? 0 : obj.indexMarcadorRuta;
    obj.indexMarcadorRuta =
      obj.indexMarcadorRuta >= this.marcadores.length - 1
        ? this.marcadores.length - 1
        : obj.indexMarcadorRuta;
  }

  play(obj: any) {
    if (obj.indexMarcadorRuta >= this.marcadores.length - 1) {
      obj.indexMarcadorRuta = this.marcadores.length;
    }
    this.repetirDiaPosicionInicio(obj);

    obj.reproducirRepetirDia = false;
    obj.btnPlayEvento = false;
    obj.btnSiguienteEnabled = false;
    obj.btnAtrasEnabled = false;

    const tiempoIntervalo =
      obj.intervalosRepetirDia[obj.invervaloRepetirDiaSeleccionado];

    obj.repeticionInterval = setInterval(() => {
      this.nextPrev(obj, 1, true, true);
      if (obj.indexMarcadorRuta >= this.marcadores.length - 1) {
        setTimeout(() => {
          this.nextPrev(obj, 1, true, true);
          this.pause(obj);
        }, 100);
      }
    }, tiempoIntervalo * 1000);
  }

  pause(obj: any) {
    clearInterval(obj.repeticionInterval);
    obj.btnPlayEvento = true;

    if (obj.indexMarcadorRuta >= this.marcadores.length - 1) {
      obj.btnSiguienteEnabled = false;
      obj.btnAtrasEnabled = true;
    } else if (obj.indexMarcadorRuta <= 0) {
      obj.btnSiguienteEnabled = true;
      obj.btnAtrasEnabled = false;
    } else if (
      obj.indexMarcadorRuta > 0 &&
      obj.indexMarcadorRuta < this.marcadores.length - 1
    ) {
      obj.btnSiguienteEnabled = true;
      obj.btnAtrasEnabled = true;
    }

    // [Entrega3 - B428] Home - Repetir Día
    if (obj.actividadesRepetirDia.length > 0) obj.reproducirRepetirDia = true;
    else {
      obj.reproducirRepetirDia = false;
      obj.btnAtrasEnabled = false;
    }
    //---

    //[Entrega3 – B358] Home - Ver Detalle / Repetir Día
    if (this.marcadores.length === 0) obj.btnAtrasEnabled = false;
    //---
  }
  repetirDiaPosicionInicio(obj: any) {
    if (obj.indexMarcadorRuta >= this.marcadores.length) {
      this.markerFlechasVisible(obj, true);
      while (obj.indexMarcadorRuta > 0) {
        this.nextPrev(obj, -1, undefined, undefined, true);
      }
      if (obj.indexMarcadorRuta <= 0) {
        this.nextPrev(obj, -1);
        obj.indexMarcadorRuta = 0;
      }
    }
  }
  rutaParcialActividadClick(obj: any, indexClick: any) {
    if (indexClick > obj.indexMarcadorRuta) {
      while (obj.indexMarcadorRuta < indexClick) {
        this.nextPrev(obj, 1, true);
      }
    } else if (indexClick < obj.indexMarcadorRuta) {
      while (obj.indexMarcadorRuta > indexClick) {
        this.nextPrev(obj, -1);
      }
    }
  }
  markerFlechasVisible(obj: any, visible: boolean = true) {
    if (!obj.markerFlechasShow) {
      obj.markerFlechasShow = true;
      this.marcadores.forEach((item: any, index: any) => {
        if (index === 0 || index === this.marcadores.length - 1)
          item.marcador.setVisible(true);
        else item.marcador.setVisible(visible);
      });
    }
  }
  agregarMarkerRepetirDia(
    obj: any,
    actividad: RepetirDiaVm,
    markerInicial: boolean = false,
    rutaProvisoria: boolean = false,
    visible: boolean = true
  ) {
    if (actividad !== null && actividad !== undefined) {
      let iconoEstadoTransmision: EstadoTransmision =
        EstadoTransmision.SinVelocidadExcedida; //.SinTransmitir;
      let excesoVelocidad: boolean = false;
      let orientacionActividad: number = actividad.orientacion;

      //Para Repetir Día sólo van los iconos de las fechas + orientación
      if (
        actividad.velocidadMaxima > 0 &&
        actividad.velocidadActual > actividad.velocidadMaxima
      ) {
        iconoEstadoTransmision = EstadoTransmision.VelocidadExcedida;
        excesoVelocidad = true;
      } else {
        iconoEstadoTransmision = EstadoTransmision.SinVelocidadExcedida;
        excesoVelocidad = false;
      }
      //---

      const repetirDiaMarker: google.maps.Marker = new google.maps.Marker({
        actividadId: actividad.id,
        fechaActividad: actividad.fechaRecepcion,
        vehiculoId: obj.vehiculoId,
        transmitiendo:
          actividad !== undefined ? actividad.transmitiendo : false,
        position: { lat: actividad.latitud, lng: actividad.longitud },
        map: obj.map,
        icon: config.getIconoMarker(
          rutaProvisoria
            ? EstadoTransmision.RutaProvisoria
            : iconoEstadoTransmision,
          orientacionActividad
        ),
        title: excesoVelocidad ? 'Velocidad Excedida' : '',
        //animation: google.maps.Animation.DROP,
        visible: visible,
      });

      let infoWindow = new google.maps.InfoWindow({
        content: config.createInfoWindow(actividad, obj.vehiculoId),
        maxWidth: 300,
      });
      (repetirDiaMarker as any).infoWindow = infoWindow;

      google.maps.event.addListener(infoWindow, 'domready', () => {
        obj.createInfoWindowBtn(obj.vehiculoId, actividad);
      });

      repetirDiaMarker.addListener('click', () => {
        //borra infoWindows existentes
        obj.infoWindows.forEach((infoWin: google.maps.InfoWindow) => {
          infoWin.close();
        });

        const openInfoWindow = () => infoWindow.open(obj.map, repetirDiaMarker);
        openInfoWindow();

        switch (obj.nombreComponente) {
          case 'mapts':
            store.commit('setGenerandoRuta', true);
            store.commit('setClickDetalle', { actividad });
            break;
          case 'actividadDetalle':
            store.commit('setClickActividadDetalle', {
              actividad,
              openInfoWindow,
            });
            store.commit('setGenerandoRutaActividadDetalle', true);
            break;
        }
        this.rutaParcialActividadClick(
          obj,
          obj.repetirDiaMarkers.findIndex(
            (act: any) =>
              act.actividadId === (repetirDiaMarker as any).actividadId
          )
        );
        this.pause(obj);
      });

      obj.infoWindows.push(infoWindow);
      obj.repetirDiaMarkers.push(repetirDiaMarker);

      //REPETIR DIA 2.0 ---------------------------------------------------------------
      this.marcadores.push({
        actividad: actividad,
        marcador: repetirDiaMarker,
      });
    }
  }
  //#endregion
}
