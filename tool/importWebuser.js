const excel = require("exceljs");
const Query = require("../mysql_query");
const wb = new excel.Workbook();


wb.xlsx.readFile('./excel/webuser.xlsx').then(async () => {
  let ws = wb.getWorksheet("webuser");
  ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber != 1) {
      let account = row.values[1];
      let password = row.values[2];
      let level = row.values[3];
      let email = row.values[4];

      

      Query("insert into webuser  values(?,?,?,?)",[account, password, level, email]);
    }
  })
})