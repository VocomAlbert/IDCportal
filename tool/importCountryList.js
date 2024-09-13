const excel = require("exceljs");
const Query = require("../mysql_query");
const wb = new excel.Workbook();


wb.xlsx.readFile('./excel/country_Ben.xlsx').then(async () => {
  let ws = wb.getWorksheet("country");
  ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber != 1) {
      let region = row.values[1];
      let countryName = row.values[2];
      

      Query("insert into countryList  values(?,?)",[region, countryName]);
    }
  })
})