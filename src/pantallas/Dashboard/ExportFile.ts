import { utils, writeFileXLSX } from 'xlsx';

function exportCsv(data: any, type: string) {
  var keys = Object.keys(data[0]);
  let csv = keys.join(';') + '\n';
  data.forEach((element: any) => {
    for (let i of keys) {
      csv += element[i] + ';';
    }
    csv += '\n';
  });
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'dashboard_' + type + '.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportExcel(data: any, type: string) {
  delete data[0]['STATUS'];
  delete data[0]['TOTAL_REGISTROS'];
  const sheet = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, sheet, 'data');
  writeFileXLSX(wb, 'dashboard_' + type + '.xlsx');
}

function exportJson(array: any, type: string) {
  const data = JSON.stringify(array);
  var blob = new Blob([data], { type: 'text/json;charset=utf-8;' });
  var link = document.createElement('a');
  var url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'dashboard_' + type + '.json');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export { exportCsv, exportExcel, exportJson };
