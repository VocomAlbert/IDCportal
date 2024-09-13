const excel = require("exceljs");
const Query = require("../mysql_query");
const wb = new excel.Workbook();


wb.xlsx.readFile('./excel/simplyIdc.xlsx').then(async () => {
  let ws = wb.getWorksheet("idc");
  ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber != 1) {
        let dataCenterId = row.values[1];
        let dataCenterOner = row.values[2];
        let region	 = row.values[3];
        let country	 = row.values[4];
        let address	 = row.values[5];
        let dataCenterName	 = row.values[6];
        let partnerContactName	 = row.values[7];
        let partnerContactPhone	 = row.values[8];
        let partnerContactEmail	 = row.values[9];
        let vocomContactName	 = row.values[10];
        let vocomContactEmail = row.values[11];


      Query("insert into idc_info(dataCenterId, dataCenterOner, region, country, address,\
        dataCenterName,partnerContactName, partnerContactPhone, partnerContactEmail, vocomContactName, vocomContactEmail\
        ) values(?,?,?,?,?,?,?,?,?,?,?)",
        [dataCenterId,
        dataCenterOner,
        region,
        country,
        address,
        dataCenterName,
        partnerContactName,
        partnerContactPhone,
        partnerContactEmail,
        vocomContactName,
        vocomContactEmail
        ])
    }
  })
})