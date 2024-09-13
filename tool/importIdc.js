const excel = require("exceljs");
const Query = require("../mysql_query");
const wb = new excel.Workbook();


wb.xlsx.readFile('./excel/idcinfo.xlsx').then(async () => {
  let ws = wb.getWorksheet("Chief_3");
  ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber != 1) {
      let dataCenterId = row.values[1];
      let dataCenterOner = row.values[2];
      let region = row.values[3];
      let country = row.values[4];
      let address = row.values[5];
      let powerTotal_MW = row.values[6] || '0';
      let powerAvail_MW = row.values[7] || '0';
      let powerDualSupply = row.values[8] || '0';
      let nPlusOneBackUp = row.values[9] || '0';
      let fuelTankCap_Liters = row.values[10] || '0';
      let upsOutageSustain_min = row.values[11];
      let fiberDualEntry = row.values[12] || '0';
      let potentExpan = row.values[13] || '0';
      let potentExpanDate = row.values[14];
      let potentExpanPower_MW = row.values[15] || '0';
      let powerPrice_KW_Hour = row.values[16];
      let spacePrice_KW = row.values[17];
      let rackMRC = row.values[18];
      let priceMRC = row.values[19];
      let pricePerKWh = row.values[20];
      let rackMax_KW = row.values[21];
      let PUE = row.values[22];
      let rackTotal = row.values[23];
      let rackAvail = row.values[24];
      let liquidCoolingReady = row.values[25] || '0';
      let countractSigned = row.values[26] || '0';
      let commission = row.values[27];
      let notes = row.values[28];

      Query("insert into idc_info(dataCenterId, dataCenterOner, region, country, \
        address, powerTotal_MW, powerAvail_MW, powerDualSupply, nPlusOneBackUp, fuelTankCap_Liters,\
        upsOutageSustain_min,fiberDualEntry,potentExpan,potentExpanDate,potentExpanPower_MW,powerPrice_KW_Hour,\
        spacePrice_KW, rackMRC, priceMRC, pricePerKWh, rackMax_KW, PUE, rackTotal, rackAvail,\
        liquidCoolingReady, countractSigned, commission,notes\
        ) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [dataCenterId,
        dataCenterOner,
        region,
        country,
        address,
        powerTotal_MW,
        powerAvail_MW,
        powerDualSupply,
        nPlusOneBackUp,
        fuelTankCap_Liters,
        upsOutageSustain_min,
        fiberDualEntry,
        potentExpan,
        potentExpanDate,
        potentExpanPower_MW,
        powerPrice_KW_Hour,
        spacePrice_KW,
        rackMRC,
        priceMRC,
        pricePerKWh,
        rackMax_KW,
        PUE,
        rackTotal,
        rackAvail,
        liquidCoolingReady,
        countractSigned,
        commission,
        notes
        ])
    }
  })
})