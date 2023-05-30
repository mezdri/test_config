import JSZip from 'jszip';
// @ts-ignore
import toGeoJSON from 'togeojson';

const parser = new DOMParser();

async function parseKmz(
  fileE: any,
  type_export: string,
  type_zone: string,
  type_download: string
): Promise<any> {
  //var file = 'C:/Users/cuent/OneDrive/Escritorio/CITRICsOS.kmz'
  var filenameCsv: string = fileE.name.slice(0, -4).replaceAll(' ', '_');
  var excludedListA: any[] = [];
  var zipS = new JSZip();
  const zipFiles = new JSZip();
  zipS
    .loadAsync(fileE)
    .then(function(zip) {
      Object.keys(zip.files).forEach(function(filename) {
        zip.files[filename]
          .async('text')
          .then(function(fileData) {
            //console.log(fileData); // These are your file contents
            var kml = parser.parseFromString(fileData, 'application/xml');
            var converted = toGeoJSON.kml(kml);
            //console.log(converted.features)
            var obj: { data: string; excludedList: any[] } = formatCsv(
              converted.features,
              type_export,
              type_zone
            );
            excludedListA = obj.excludedList;
            var csv: string = obj.data;
            csv = csv.replaceAll('/', '-');
            if (type_download == 'allPolygon') {
              var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              var link = document.createElement('a');
              var url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute(
                'download',
                filenameCsv + '_' + type_export + '.csv'
              );
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              var nameFile: string = '';
              const FileSaver = require('file-saver');
              const separator: string = type_export == 'track3' ? ';' : ',';
              var count: number = 0;
              var arrayPolygons: string[] = csv.split('\n').slice(1);
              var arrayPoyligon: string[] = [];
              var header: string =
                type_export == 'director' || type_export == 'track3'
                  ? csv.split('\n')[0] + '\n'
                  : '';
              for (var polygon of arrayPolygons) {
                arrayPoyligon = polygon.split(separator);
                nameFile =
                  type_export == 'director'
                    ? arrayPoyligon[0]
                    : arrayPoyligon[1];
                if (nameFile) {
                  nameFile = nameFile.replaceAll('/', '-');
                }
                zipFiles.file(
                  count + '_' + nameFile + '.csv',
                  header + polygon
                );
                count += 1;
              }
              zipFiles.generateAsync({ type: 'blob' }).then(function(content) {
                FileSaver.saveAs(
                  content,
                  filenameCsv + '_' + type_export + '.zip'
                );
              });
            }
          })
          .finally(() => {
            return excludedListA;
          });
      });
    })
    .finally(() => {
      return excludedListA;
    });
  await delay(1000);
  return excludedListA;
}

function formatCsv(data: any, type_export: string, type_zone: string) {
  try {
    var track3String: string =
      'TipoZona*;Nombre*;Descripcion;Direccion;TipoGeometria*;Coordenadas*;VelocidadMaxGeo\n';
    var navmanString: string = ''; //;Nombre;Tipo;Correo Entrada; Correo Salida; poly; Velocidad; Correo Inicio; Correo Fin; Latitud 1; Longitud 1\n";
    var director: string =
      'Site Name,Description,Site Type,Size,Size Unit,Boundary Type,Live Alert,Site Entry Email,Site Exit Email,Speed Unit,Over Speed threshold,Site overspeed start email,Site overspeed end email,Address 1,Address 2,Address 3,Address 4,Address 5,Notes,Start Date,End Date,Latitude 1,Longitude 1,Latitude 2,Longitude 2,Latitude 3,Longitude 3,Latitude 4,Longitude 4,Latitude 5,Longitude 5,Latitude 6,Longitude 6,Latitude 7,Longitude 7,Latitude 8,Longitude 8,Latitude 9,Longitude 9,Latitude 10,Longitude 10,Latitude 11,Longitude 11,Latitude 12,Longitude 12,Latitude 13,Longitude 13,Latitude 14,Longitude 14,Latitude 15,Longitude 15,Latitude 16,Longitude 16,Latitude 17,Longitude 17,Latitude 18,Longitude 18,Latitude 19,Longitude 19,Latitude 20,Longitude 20,Latitude 21,Longitude 21,Latitude 22,Longitude 22,Latitude 23,Longitude 23,Latitude 24,Longitude 24,Latitude 25,Longitude 25,Latitude 26,Longitude 26,Latitude 27,Longitude 27,Latitude 28,Longitude 28,Latitude 29,Longitude 29,Latitude 30,Longitude 30,Latitude 31,Longitude 31,Latitude 32,Longitude 32,Latitude 33,Longitude 33,Latitude 34,Longitude 34,Latitude 35,Longitude 35,Latitude 36,Longitude 36,Latitude 37,Longitude 37,Latitude 38,Longitude 38,Latitude 39,Longitude 39,Latitude 40,Longitude 40,Latitude 41,Longitude 41,Latitude 42,Longitude 42,Latitude 43,Longitude 43,Latitude 44,Longitude 44,Latitude 45,Longitude 45,Latitude 46,Longitude 46,Latitude 47,Longitude 47,Latitude 48,Longitude 48,Latitude 49,Longitude 49,Latitude 50,Longitude 50,\n';
    var dataOut: string =
      type_export == 'track3'
        ? track3String
        : type_export == 'navman'
        ? navmanString
        : type_export == 'director'
        ? director
        : '';
    type_zone =
      type_export == 'track3'
        ? type_zone == 'sitios'
          ? 'Sitio'
          : 'Geocerca'
        : type_zone;
    var start: string = type_zone == 'sitios' ? 'sitedef' : 'geodef';
    var geometryId: number = 0;
    var sep: string = ';';
    var excludedList: any[] = [];
    var geometry: string = '';
    var cli_vel: string = '';
    var cli_dir: string = '';
    var countGeo: number = 0;
    var type: string = '';
    var returnPointList: number[] = [];
    var name_zone: string = '';
    for (var item of data) {
      name_zone =
        item.properties.name.length > 40
          ? item.properties.name.substring(0, 40) + '...'
          : item.properties.name;

      name_zone = name_zone.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (item.properties.hasOwnProperty('CLI_VEL')) {
        cli_vel = item.properties.CLI_VEL;
      } else if (item.properties.hasOwnProperty('cli_vel')) {
        cli_vel = item.properties.cli_vel;
      } else {
        cli_vel = '30';
      }
      cli_vel = cli_vel.replace('vel', '');
      cli_vel = cli_vel.replace('VEL', '');

      if (item.properties.hasOwnProperty('CLI_DIRECCION')) {
        cli_dir = item.properties.CLI_DIRECCION;
      } else if (item.properties.hasOwnProperty('cli_direccion')) {
        cli_dir = item.properties.cli_direccion;
      } else {
        cli_dir = '';
      }

      if (type_export == 'track3') {
        if (item.geometry.type == 'Polygon') {
          // Polígonos
          for (var it of item.geometry.coordinates) {
            for (var indx of it) {
              geometry += indx[1] + ',' + indx[0] + '|';
            }
            if (geometry.slice(-1) == '|') {
              geometry = geometry.slice(0, -1);
            }

            type = 'Poligono';

            if (geometry.split('|').length <= 50) {
              dataOut +=
                type_zone +
                sep +
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                '' +
                sep +
                cli_dir +
                sep +
                type +
                sep +
                geometry +
                sep +
                (isNumeric(cli_vel) ? cli_vel : '30') +
                '\n';
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            geometry = '';
          }
        } else if (item.geometry.type == 'Point') {
          // Puntos
          if (item.geometry.coordinates[2] == '0') {
            type = 'Marcador';
            geometry =
              item.geometry.coordinates[1] + ',' + item.geometry.coordinates[0];
          } else {
            type = 'Circunferencia';
            geometry =
              item.geometry.coordinates[1] +
              ',' +
              item.geometry.coordinates[0] +
              ',' +
              item.geometry.coordinates[2];
          }

          if (type == 'Marcador') {
            dataOut += type;
          } else {
            dataOut += type_zone;
          }
          if (geometry.split('|').length <= 50) {
            dataOut +=
              sep +
              name_zone.replaceAll(',', '_') +
              '_' +
              geometryId +
              sep +
              '' +
              sep +
              cli_dir +
              sep +
              type +
              sep +
              geometry +
              sep +
              (isNumeric(cli_vel) ? cli_vel : '30') +
              '\n';
            geometryId += 1;
          }
          geometry = '';
          type = '';
        } else if (item.geometry.type == 'GeometryCollection') {
          // geometrías
          for (var its of item.geometry.geometries) {
            for (var at of its.coordinates) {
              for (var index of at) {
                //console.log(it)
                geometry += index[1] + ',' + index[0] + '|';
              }
            }
            if (geometry.slice(-1) == '|') {
              geometry = geometry.slice(0, -1);
            }

            if (geometry.split('|').length == 4) {
              type = 'Rectangulo';
            } else {
              type = 'Poligono';
            }

            if (geometry.split('|').length <= 50) {
              dataOut +=
                type_zone +
                sep +
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                '' +
                sep +
                cli_dir +
                sep +
                type +
                sep +
                geometry +
                sep +
                (isNumeric(cli_vel) ? cli_vel : '30') +
                '\n';
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            geometry = '';
          }
        }
        geometry = '';
      } else if (type_export == 'navman') {
        sep = ',';
        if (item.geometry.type == 'Polygon') {
          // Poligono
          for (var itNav of item.geometry.coordinates) {
            for (var indxNav of itNav) {
              if (valideDistance(returnPointList, indxNav[1], indxNav[0])) {
                returnPointList.push(indxNav[1]);
                returnPointList.push(indxNav[0]);
              }
            }

            geometry = returnPointList.join(',');

            if (returnPointList.length <= 100 && returnPointList.length >= 6) {
              if (type_zone == 'geocercas') {
                dataOut +=
                  start +
                  sep +
                  name_zone.replaceAll(',', '_') +
                  '_' +
                  geometryId +
                  sep +
                  'Default' +
                  sep +
                  sep +
                  sep +
                  'poly' +
                  sep +
                  (isNumeric(cli_vel) ? cli_vel : '30') +
                  sep +
                  sep +
                  sep +
                  geometry +
                  '\n';
              } else {
                dataOut +=
                  start +
                  sep +
                  name_zone.replaceAll(',', '_') +
                  '_' +
                  geometryId +
                  sep +
                  sep +
                  'Default' +
                  sep +
                  '' +
                  sep +
                  '' +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  'poly' +
                  sep +
                  geometry +
                  '\n';
              }
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            returnPointList = [];
            geometry = '';
          }
        } else if (item.geometry.type == 'Point') {
          // // Punto
          // if (item.geometry.coordinates[2] == '0') {
          //   type = 'simple';
          //   geometry =
          //     item.geometry.coordinates[1] + sep + item.geometry.coordinates[0];
          // } else {
          //   type = 'simple';
          //   geometry = item.geometry.coordinates[0] + sep + item.geometry.coordinates[1];
          // }
          // if (item.properties.hasOwnProperty('CLI_VEL')) {
          //   cli_vel = item.properties.CLI_VEL;
          // } else if (item.properties.hasOwnProperty('cli_vel')) {
          //   cli_vel = item.properties.cli_vel;
          // } else {
          //   cli_vel = '';
          // }
          // cli_vel = cli_vel.replace('vel', '');
          // cli_vel = cli_vel.replace('VEL', '');
          // console.log(name_zone)
          // if (type_zone == "geocercas"){
          //   dataOut += start + sep + name_zone.replaceAll(",","_") + '_' + geometryId + sep + 'Default' + sep + sep + sep + type + sep + (isNumeric(cli_vel) ? cli_vel : '30') + sep + sep + sep + geometry + sep + 'meters' + sep + '100' + sep + 'standard' + '\n';
          // }else{
          //   dataOut += start + sep + name_zone.replaceAll(",","_") + '_' + geometryId + sep + sep + 'Default' + sep + "" + sep + "" + sep + sep + sep + sep + sep + type + sep + geometry + sep + "meters" + sep + "100" + sep + "standard" +"\n"
          // }
          // geometryId += 1;
          // geometry = '';
        } else if (item.geometry.type == 'GeometryCollection') {
          // geometrias
          for (itsNav of item.geometry.geometries) {
            for (atNav of itsNav.coordinates) {
              for (indexNav of atNav) {
                if (valideDistance(returnPointList, indxNav[1], indxNav[0])) {
                  returnPointList.push(indxNav[1]);
                  returnPointList.push(indxNav[0]);
                }
              }
            }

            geometry = returnPointList.join(',');

            if (returnPointList.length <= 100 && returnPointList.length >= 6) {
              if (type_zone == 'geocercas') {
                dataOut +=
                  start +
                  sep +
                  name_zone.replaceAll(',', '_') +
                  '_' +
                  geometryId +
                  sep +
                  'Default' +
                  sep +
                  sep +
                  sep +
                  'poly' +
                  sep +
                  (isNumeric(cli_vel) ? cli_vel : '30') +
                  sep +
                  sep +
                  sep +
                  geometry +
                  '\n';
              } else {
                dataOut +=
                  start +
                  sep +
                  name_zone.replaceAll(',', '_') +
                  '_' +
                  geometryId +
                  sep +
                  sep +
                  'Default' +
                  sep +
                  '' +
                  sep +
                  '' +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  sep +
                  'poly' +
                  sep +
                  geometry +
                  '\n';
              }
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            geometry = '';
            returnPointList = [];
          }
        }
        geometry = '';
      } else if (type_export == 'director') {
        sep = ',';
        var typeZone_director: string = type_zone == 'geocercas' ? 'No' : 'No';
        if (item.geometry.type == 'Polygon') {
          // Polígono
          for (itNav of item.geometry.coordinates.reverse()) {
            for (indxNav of itNav) {
              if (valideDistance(returnPointList, indxNav[1], indxNav[0])) {
                returnPointList.push(indxNav[1]);
                returnPointList.push(indxNav[0]);
              }
            }

            geometry = returnPointList.join(',');

            if (returnPointList.length <= 100 && returnPointList.length >= 6) {
              dataOut +=
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                'Default' +
                sep +
                '' +
                sep +
                '' +
                sep +
                'poly' +
                sep +
                typeZone_director +
                sep +
                sep +
                sep +
                sep +
                (isNumeric(cli_vel) ? cli_vel : '30') +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                geometry +
                '\n';
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            geometry = '';
            returnPointList = [];
          }
        } else if (item.geometry.type == 'Point') {
          // Punto
          // if (item.geometry.coordinates[2] == '0') {
          //   type = 'simple';
          //   geometry =
          //     item.geometry.coordinates[1] + sep + item.geometry.coordinates[0];
          // } else {
          //   type = 'simple';
          //   geometry =
          //     item.geometry.coordinates[0] +
          //     sep +
          //     item.geometry.coordinates[1] +
          //     sep +
          //     item.geometry.coordinates[2];
          // }
          // if (item.properties.hasOwnProperty('CLI_VEL')) {
          //   cli_vel = item.properties.CLI_VEL;
          // } else if (item.properties.hasOwnProperty('cli_vel')) {
          //   cli_vel = item.properties.cli_vel;
          // } else {
          //   cli_vel = '';
          // }
          // cli_vel = cli_vel.replace('vel', '');
          // cli_vel = cli_vel.replace('VEL', '');
          // dataOut += name_zone.replaceAll(",","_") + '_' + geometryId + sep + name_zone.replaceAll(",","_") + '_' + geometryId + sep + 'Default' + sep + '' + sep + '' + sep + type + sep + 'Yes' + sep + sep + sep + (isNumeric(cli_vel) ? cli_vel : '30') + sep + cli_vel +
          //   sep + sep + sep + sep + sep + sep + sep + sep + sep + sep + sep + geometry + '\n';
          // geometryId += 1;
          // geometry = '';
        } else if (item.geometry.type == 'GeometryCollection') {
          for (var itsNav of item.geometry.geometries.reverse()) {
            for (var atNav of itsNav.coordinates) {
              for (var indexNav of atNav) {
                if (valideDistance(returnPointList, indxNav[1], indxNav[0])) {
                  returnPointList.push(indxNav[1]);
                  returnPointList.push(indxNav[0]);
                }
              }
            }

            geometry = returnPointList.join(',');

            if (returnPointList.length <= 100 && returnPointList.length >= 6) {
              dataOut +=
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                name_zone.replaceAll(',', '_') +
                '_' +
                geometryId +
                sep +
                'Default' +
                sep +
                '' +
                sep +
                '' +
                sep +
                'poly' +
                sep +
                typeZone_director +
                sep +
                sep +
                sep +
                sep +
                (isNumeric(cli_vel) ? cli_vel : '30') +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                sep +
                geometry +
                '\n';
              geometryId += 1;
            } else {
              excludedList.push(
                name_zone.replaceAll(',', '_') + '-' + countGeo
              );
            }
            countGeo++;
            geometry = '';
            returnPointList = [];
          }
        }
      }
    }
    dataOut = dataOut.slice(-1) == '\n' ? dataOut.slice(0, -1) : dataOut;
    return { data: dataOut, excludedList: excludedList };
  } catch (error) {
    return {
      data:
        'El archivo Kmz no se ha podido exportar con exito, revise si el formato del archivo es correcto.',
      excludedList: [],
    };
  }
}

// function validePoints(pointList: number[]){
//   var returnPointList: number[] = []
//   for(var i = 0; i < pointList.length; i+=2){
//       if(valideDistance(returnPointList, pointList[i], pointList[i+1])){
//         returnPointList.push(pointList[i]);
//         returnPointList.push(pointList[i+1]);
//       }
//   }
//   return returnPointList
// }

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function valideDistance(pointList: number[], lat: number, lon: number) {
  var valideDistance: boolean = true;
  for (var i = 0; i < pointList.length; i += 2) {
    if (
      getDistanceFromPoints(pointList[i], pointList[i + 1], lat, lon) * 1000 <
      1.5
    ) {
      valideDistance = false;
      break;
    }
  }
  return valideDistance;
}

function getDistanceFromPoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: any) {
  return deg * (Math.PI / 180);
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { parseKmz };
