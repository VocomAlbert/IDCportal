const Query = require('../mysql_query');
const MOMENT = require('moment');
const Mail = require('../idc_mail.js');
const excel = require('exceljs');
const wb = new excel.Workbook();
const FS = require('fs');

module.exports.getIdc_Info = async function (powerPrice_KW_Hour, powerPrice_KW_Month, price_AllIn, powerAvail_MW, rackAvail, region, country) {
    let data;
    if (country != -1) {
        data = await Query("select * from idc_info where (powerPrice_KW_Hour >= ? and powerPrice_KW_Hour < ?) and (powerPrice_KW_Month >= ? and powerPrice_KW_Month < ?) and (price_AllIn >= ? and price_AllIn < ?) and (powerAvail_MW > ? and powerAvail_MW < ?) and (rackAvail >= ? and rackAvail < ?) and approval = 1 and country = ?", [powerPrice_KW_Hour.split(',')[0], powerPrice_KW_Hour.split(',')[1], powerPrice_KW_Month.split(',')[0], powerPrice_KW_Month.split(',')[1], price_AllIn.split(',')[0], price_AllIn.split(',')[1], powerAvail_MW.split(',')[0], powerAvail_MW.split(',')[1], rackAvail.split(',')[0], rackAvail.split(',')[1], country]);
    } else if(region != -1){
        data = await Query("select * from idc_info where (powerPrice_KW_Hour >= ? and powerPrice_KW_Hour < ?) and (powerPrice_KW_Month >= ? and powerPrice_KW_Month < ?) and (price_AllIn >= ? and price_AllIn < ?) and (powerAvail_MW > ? and powerAvail_MW < ?) and (rackAvail >= ? and rackAvail < ?) and approval = 1 and region = ?", [powerPrice_KW_Hour.split(',')[0], powerPrice_KW_Hour.split(',')[1], powerPrice_KW_Month.split(',')[0], powerPrice_KW_Month.split(',')[1], price_AllIn.split(',')[0], price_AllIn.split(',')[1], powerAvail_MW.split(',')[0], powerAvail_MW.split(',')[1], rackAvail.split(',')[0], rackAvail.split(',')[1], region]);
    }else{
        data = await Query("select * from idc_info where (powerPrice_KW_Hour >= ? and powerPrice_KW_Hour < ?) and (powerPrice_KW_Month >= ? and powerPrice_KW_Month < ?) and (price_AllIn >= ? and price_AllIn < ?) and (powerAvail_MW > ? and powerAvail_MW < ?) and (rackAvail >= ? and rackAvail < ?) and approval = 1", [powerPrice_KW_Hour.split(',')[0], powerPrice_KW_Hour.split(',')[1], powerPrice_KW_Month.split(',')[0], powerPrice_KW_Month.split(',')[1], price_AllIn.split(',')[0], price_AllIn.split(',')[1], powerAvail_MW.split(',')[0], powerAvail_MW.split(',')[1], rackAvail.split(',')[0], rackAvail.split(',')[1]]);
    }

    let singleSelection = [
        "powerDualSupply",
        "nPlusOneBackUp",
        "fiberDualEntry",
        "potentExpan",
        "liquidCoolingReady",
        "countractSigned"
    ]
    for (let i = 0; i < data.length; i++) {
        data[i].lastModifiedAt = MOMENT(data[i].lastModifiedAt).format('YYYY-MM-DD HH:mm:ss');
        data[i].createdAt = MOMENT(data[i].createdAt).format('YYYY-MM-DD HH:mm:ss');
        delete data[i].countractSigned
        delete data[i].commission
        delete data[i].dataCenterOner
        delete data[i].dataCenterName
        delete data[i].address
        delete data[i].partnerContactName
        delete data[i].partnerContactPhone
        delete data[i].partnerContactEmail
        delete data[i].vocomContactName
        delete data[i].vocomContactEmail

        for(const [key , value] of Object.entries(data[i])){
            if(singleSelection.includes(key)){
                if(value == 0){
                    data[i][key] = 'Not comfirmed'
                }else if(value == 1){
                    data[i][key] = 'Yes'
                }else{
                    data[i][key] = 'No'
                }
            }else if(!value){
                data[i][key] = 'Upon request'
            }
        }
    }
    

    return data;
}

module.exports.getRegionList = async function () {
    let data;
    data = await Query("select distinct region from countryList");
    return data;
}

module.exports.getCountryList = async function () {
    let data;
    data = await Query("select * from countryList");
    return data;
}

module.exports.getIdcList = async function (account, level, dataCenterOner, vocomContactName, remark, approval) {
    let data;
    if (level <= 1) {
        data = await Query("select dataCenterOner, dataCenterId, dataCenterName,  powerAvail_MW, powerPrice_KW_Hour, powerPrice_KW_Month, price_AllIn, rackAvail, vocomContactName, notes, approval, lastModifiedAt from idc_info order by dataCenterOner");
    } else if (level == 2) {
        data = await Query("select dataCenterOner, dataCenterId, dataCenterName, powerAvail_MW, powerPrice_KW_Hour, powerPrice_KW_Month, price_AllIn, rackAvail, vocomContactName, notes, approval, lastModifiedAt from idc_info where dataCenterOner = ?", [account]);
    }

    for(let i=0;i<data.length;i++){
        data[i].lastModifiedAt = MOMENT(data[i].lastModifiedAt).format('YYYY-MM-DD HH:mm:ss');
        if(data[i].powerAvail_MW && (data[i].powerPrice_KW_Hour || data[i].powerPrice_KW_Month || data[i].price_AllIn)){
            data[i].remark = "Modified"
        }else{
            data[i].remark = "Need modified"
        }

        if(data[i].approval == 1){
            data[i].approvalStatus = 'Approved'
        }else if(data[i].approval == -1){
            data[i].approvalStatus = 'Reject'
        }else{
            data[i].approvalStatus = 'Not approved'
        }
    }

    if (dataCenterOner != 0) {
        if (data.length == 0) {
            return [];
        } else {
            data = data.filter(function (value) {
                return value.dataCenterOner == dataCenterOner
            })
        }

    }

    if (vocomContactName != 0) {
        if (data.length == 0) {
            return [];
        } else {
            data = data.filter(function (value) {
                return value.vocomContactName == vocomContactName
            })
        }

    }

    if (remark != 0) {
        if (data.length == 0) {
            return [];
        } else {
            data = data.filter(function (value) {
                return value.remark == remark
            })
        }

    }

    if (approval != 2) {
        if (data.length == 0) {
            return [];
        } else {
            data = data.filter(function (value) {
                return value.approval == approval
            })
        }

    }

    

    return data;
}

module.exports.getIdcPartnerList = async function (account, level) {
    let data;
    if (level <= 1) {
        data = await Query("select distinct dataCenterOner from idc_info order by dataCenterOner");
    } else if (level == 2) {
        data = [{dataCenterOner : account}]
    }
    return data;
}

module.exports.getIdcManagerList = async function () {
    let data = await Query("select distinct vocomContactName from idc_info");;

    return data;
}

module.exports.getIdcDetail = async function (dataCenterId) {
    let data;
    let singleSelection = [
        "powerDualSupply",
        "nPlusOneBackUp",
        "fiberDualEntry",
        "potentExpan",
        "liquidCoolingReady",
        "countractSigned",
    ]
        
    
    if (dataCenterId) {
        data = await Query("select * from idc_info where dataCenterId = ?", [dataCenterId]);
    } else {
        data = await Query("select * from idc_info limit 1");
    }

    for(const [key , value] of Object.entries(data[0])){
        if(singleSelection.includes(key)){
            if(value == 0){
                data[0][key] = 'Not comfirmed'
            }else if(value == 1){
                data[0][key] = 'Yes'
            }else{
                data[0][key] = 'No'
            }
        }else if(!value){
            data[0][key] = 'No Data'
        }
    }
    return data;
}

module.exports.getCertificationTier = async function () {
    let data;
    data = await Query("select name from certificationTier");
    return data;
}

module.exports.getCertificationISO = async function () {
    let data;
    data = await Query("select * from certificationISO");
    return data;
}

module.exports.getDateList = async function () {
    let data = [];
    let datetime = MOMENT().format("YYYY-MM");
    let year = parseInt(datetime.slice(0, 4));
    let month = parseInt(datetime.slice(-2));
    let quarter = Math.ceil(month / 3);
    for (let i = quarter; i <= 4; i++) {
        data.push(year + ' Q' + i);
    }
    for (let i = 1; i < 10; i++) {
        for (let k = 1; k <= 4; k++) {
            data.push(year + i + ' Q' + k)
        }

    }
    return data;
}

module.exports.updateIDCinfo = async function (
    account,
    dataCenterId,
    certificationTier,
    certificationISO,
    powerTotal_MW,
    powerAvail_MW,
    upsOutageSustain_min,
    potentExpanPower_MW,
    powerPrice_KW_Hour,
    powerPrice_KW_Month,
    spacePrice_KW,
    price_AllIn,
    rackMRC,
    priceMRC,
    pricePerKWh,
    rackMax_KW_LC,
    rackMax_KW_AC,
    PUE,
    rackTotal,
    rackAvail,
    minContractTerm,
    powerDualSupply,
    nPlusOneBackUp,
    fuelTankCap_Liters,
    fuelTankCap_hour,
    fiberDualEntry,
    potentExpan,
    liquidCoolingReady,
    reservationRequirement,
    potentExpanDate,
    liquidCoolingReadyDate,
    notes,
) {
    let multipleSelection = {
        certificationTier,
        certificationISO
    }
    let number = {
        powerTotal_MW,
        powerAvail_MW,
        upsOutageSustain_min,
        potentExpanPower_MW,
        powerPrice_KW_Hour,
        powerPrice_KW_Month,
        spacePrice_KW,
        price_AllIn,
        rackMRC,
        priceMRC,
        pricePerKWh,
        rackMax_KW_LC,
        rackMax_KW_AC,
        PUE,
        rackTotal,
        rackAvail,
        minContractTerm,
        reservationRequirement,
        fuelTankCap_Liters,
        fuelTankCap_hour
    }
    let singleSelection = {
        powerDualSupply,
        nPlusOneBackUp,
        fiberDualEntry,
        potentExpan,
        liquidCoolingReady,
    }
    let keyInformation = {
        powerAvail_MW,
        powerPrice_KW_Hour,
        powerPrice_KW_Month,
        price_AllIn
    }
    const needModify_multipleSelection = Object.fromEntries(
        Object.entries(multipleSelection).filter(([key, value]) => value != -1)
    );

    const needModify_number = Object.fromEntries(
        Object.entries(number).filter(([key, value]) => value != -1)
    );

    const needModify_singleSelection = Object.fromEntries(
        Object.entries(singleSelection).filter(([key, value]) => value != -2)
    );

    const keyInformation_changeApproval = Object.fromEntries(
        Object.entries(keyInformation).filter(([key, value]) => value != -1)
    );

    if (Object.keys(needModify_multipleSelection).length) {
        for (const [key, value] of Object.entries(needModify_multipleSelection)) {
            //check if only one selected, only one : string, more than one : array
            let valueList
            if (value[0].length > 1) {
                    valueList = value[0];
                for (let i = 1; i < value.length; i++) {
                    valueList += ',' + value[i];
                }
            } else {
                valueList = value;
            }
            let originalData = await Query(`select ${key} from idc_info where dataCenterId = ?`, [dataCenterId]);
            let keys = Object.keys(originalData[0]);
            await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update ${key} from ? to ?",?)`, [dataCenterId, originalData[0][keys[0]], valueList, account])
            await Query(`update idc_info set ${key} = ? where dataCenterId = ?`, [valueList, dataCenterId]);
        }
    }

    if (Object.keys(needModify_number).length) {
        for (const [key, value] of Object.entries(needModify_number)) {
            let originalData = await Query(`select ${key} from idc_info where dataCenterId = ?`, [dataCenterId]);
            let keys = Object.keys(originalData[0]);
            await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update ${key} from ? to ?",?)`, [dataCenterId, originalData[0][keys[0]], value, account])
            await Query(`update idc_info set ${key} = ? where dataCenterId = ?`, [value, dataCenterId]);
        }
    }

    if (Object.keys(needModify_singleSelection).length) {
        for (const [key, value] of Object.entries(needModify_singleSelection)) {
            let originalData = await Query(`select ${key} from idc_info where dataCenterId = ?`, [dataCenterId]);
            let keys = Object.keys(originalData[0]);
            await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update ${key} from ? to ?",?)`, [dataCenterId, originalData[0][keys[0]], value, account])
            await Query(`update idc_info set ${key} = ? where dataCenterId = ?`, [value, dataCenterId]);
        }
    }

    if (Object.keys(keyInformation_changeApproval).length) {
        let originalData = await Query(`select approval from idc_info where dataCenterId = ?`, [dataCenterId]);
        
        await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update approval from ? to ?",?)`, [dataCenterId, originalData[0].approval, -1, account])
        await Query(`update idc_info set approval = -1 where dataCenterId = ?`, [dataCenterId]);
    }

    if(potentExpanDate != -1){
        let originalData = await Query(`select potentExpanDate from idc_info where dataCenterId = ?`, [dataCenterId]);
        await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update potentExpanDate from ? to ?",?)`, [dataCenterId, originalData[0].potentExpanDate, potentExpanDate, account])
        await Query(`update idc_info set potentExpanDate = ? where dataCenterId = ?`, [potentExpanDate, dataCenterId]);
    }

    if(liquidCoolingReadyDate != -1){
        let originalData = await Query(`select liquidCoolingReadyDate from idc_info where dataCenterId = ?`, [dataCenterId]);
        await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update liquidCoolingReadyDate from ? to ?",?)`, [dataCenterId, originalData[0].liquidCoolingReadyDate, liquidCoolingReadyDate, account])
        await Query(`update idc_info set liquidCoolingReadyDate = ? where dataCenterId = ?`, [liquidCoolingReadyDate, dataCenterId]);
    }
    if(notes){
        const pattern = /[!@#$%^&*+{}:><?;]/;
        specialWords = ['delete', 'update', 'insert'];
        if(notes.match(pattern) ||  specialWords.some(words => notes.includes(words)) || notes.length>499){
            return 0;
        }else{
            let originalData = await Query(`select notes from idc_info where dataCenterId = ?`, [dataCenterId]);
            await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update notes from ? to ?",?)`, [dataCenterId, originalData[0].notes, potentExpanDate, account])
            await Query(`update idc_info set notes = ? where dataCenterId = ?`, [notes, dataCenterId]);
        }
    }
    
    return 1;
}

module.exports.updateApproval = async function(account, changeApproval){
    let tmp = changeApproval.split(" ")
    let approval = tmp[tmp.length - 1];
    tmp.pop()
    let dataCenterId = tmp.join(' ');
    

    let originalApproval = await Query("select approval from idc_info where dataCenterId = ?",[dataCenterId])
    await Query(`insert into idc_history (dataCenterId, notes, modifiedBy) values (?,"update approval from ? to ?",?)`, [dataCenterId, originalApproval[0].approval, approval, account])
    await Query(`update idc_info set approval = ? where dataCenterId = ?`, [approval, dataCenterId]);
}

module.exports.mailWishList = async function (
    account,
    location,
    powerAvail_MW,
    powerPrice_KW_Hour,
    spacePrice_KW,
    rackMax_KW,
    liquidCoolingReady,
    deploymentDate,
    remark
){
    let path = `./public/excel/wishList/`
    if(location){
        const pattern = /[!@#$%^&*+{}:><?;]/;
        specialWords = ['delete', 'update', 'insert'];
        if(location.match(pattern) ||  specialWords.some(words => location.includes(words)) || location.length>499){
            return -1;
        }
    }

    if(remark){
        const pattern = /[!@#$%^&*+{}:><?;]/;
        specialWords = ['delete', 'update', 'insert'];
        if(remark.match(pattern) ||  specialWords.some(words => remark.includes(words)) || remark.length>499){
            return -1;
        }
    }

    await Query(`insert into idc_wishList (createdBy, location, powerAvail_MW, powerPrice_KW_Hour, spacePrice_KW, rackMax_KW, liquidCoolingReady, deploymentDate, remark)\
    values (?,?,?,?,?,?,?,?,?)`,
        [account,
        location,
        powerAvail_MW,
        powerPrice_KW_Hour,
        spacePrice_KW,
        rackMax_KW,
        liquidCoolingReady,
        deploymentDate,
        remark]
    )

    let LCtoWords = '';
    switch(liquidCoolingReady){
        case '0' :
            LCtoWords = 'No requirement'
            break;
        case '1' :
            LCtoWords = 'Yes'
            break;
        case '-1' :
            LCtoWords = 'No'
            break;
        
    }
    
    let tableHtml = `
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
    <tr>
        <th>Column</th>
        <th>Data</th>
    </tr>  
    <tr>
        <td>Request By</td>
        <td>${account}</td>
    </tr>
    <tr>
        <td>Requested Location</td>
        <td>${location}</td>
    </tr>
    <tr>
        <td>Required Power(MW)</td>
        <td>${powerAvail_MW}</td>
    </tr>
    <tr>
        <td>Target Power Price(USD)</td>
        <td>${powerPrice_KW_Hour}</td>
    </tr>
    <tr>
        <td>Target Space Price(USD)</td>
        <td>${spacePrice_KW}</td>
    </tr>
    <tr>
        <td>Max Power per Rack</td>
        <td>${rackMax_KW}</td>
    </tr>
    <tr>
        <td>Liquid Cooling</td>
        <td>${LCtoWords}</td>
    </tr>
    <tr>
        <td>Deployment Date</td>
        <td>${deploymentDate}</td>
    </tr>
    <tr>
        <td>Remark</td>
        <td>${remark}</td>
    </tr>
  `;
    await EditExcelFile(
        account,
        location,
        powerAvail_MW,
        powerPrice_KW_Hour,
        spacePrice_KW,
        rackMax_KW,
        liquidCoolingReady,
        deploymentDate,
        remark
    )

    let message = {
        to: `albert@vocom.com`,
        subject: `New IDC request from ${account}!`,
        html: `
        <h1>Information</h1>
        ${tableHtml}
        `,
        attachments: [
            {
                filename: 'wishList.xlsx',
                path: `${path}/wishList.xlsx`,
            },
        ],
    }
    Mail(message);
    return 1;
}

async function EditExcelFile(
    account,
    location,
    powerAvail_MW,
    powerPrice_KW_Hour,
    spacePrice_KW,
    rackMax_KW,
    liquidCoolingReady,
    deploymentDate,
    remark
){
    const wishListExcel = new excel.Workbook();
    let path = `./public/excel/wishList/`
    //  Check if path existence
    if (!FS.existsSync(path)) {
        FS.mkdirSync(path, { recursive: true });
    }
    //  Check if excel file existence
    if (!FS.existsSync(`${path}/wishList.xlsx`)) {
        await wishListExcel.xlsx.writeFile(`${path}/wishList.xlsx`);
      }
    //  Read the excel file
    let originalExcel = new excel.Workbook();
    await originalExcel.xlsx.readFile(`${path}/wishList.xlsx`);
    
    let workSheet = originalExcel.getWorksheet('wishList');
    if(!workSheet){
        workSheet = originalExcel.addWorksheet('wishList', {
            views: [{ state: 'frozen', ySplit: 1 }],
          });
          for (let i = 1; i <= 10; i++) {
            let wsColumn = workSheet.getColumn(i);
            switch (i) {
              case 1: {
                wsColumn.width = 20;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'fffff2cc' },
                };
                break;
              }
              case 2: {
                wsColumn.width = 50;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffc9c9c9' },
                };
                break;
              }
              case 3: {
                wsColumn.width = 25;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffe2efda' },
                };
                break;
              }
              case 4: {
                wsColumn.width = 25;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffddebf7' },
                };
                break;
              }
              case 5: {
                wsColumn.width = 25;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffc9c9c9' },
                };
                break;
              }
              case 6: {
                wsColumn.width = 25;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'fff8cbad' },
                };
                break;
              }
              case 7: {
                wsColumn.width = 25;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'fffff2cc' },
                };
                break;
              }
              case 8: {
                wsColumn.width = 30;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffe2efda' },
                };
                break;
              }
              case 9: {
                wsColumn.width = 30;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffffffff' },
                };
                break;
              }
              case 10: {
                wsColumn.width = 50;
                wsColumn.alignment = { horizontal: 'center' };
                wsColumn.font = { bold: true };
                wsColumn.border = {
                  top: { style: 'double' },
                  left: { style: 'double' },
                  bottom: { style: 'double' },
                  right: { style: 'double' },
                };
                wsColumn.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'ffffffff' },
                };
                break;
              }
            }
          }
          workSheet.addRow([
            'Request By',
            'Location',
            'Avail Power(MW)',
            'Power Price(USD)',
            'Space Price(USD)',
            'Max Power per Rack',
            'Liquid Cooling',
            'Deployment Date',
            'Created Date',
            'Remark',
          ]);
    }

    let LCtoWords = '';
    switch(liquidCoolingReady){
        case '0' :
            LCtoWords = 'No requirement'
            break;
        case '1' :
            LCtoWords = 'Yes'
            break;
        case '-1' :
            LCtoWords = 'No'
            break;
        
    }
    workSheet.addRow([
        account,
        location,
        powerAvail_MW,
        powerPrice_KW_Hour,
        spacePrice_KW,
        rackMax_KW,
        LCtoWords,
        deploymentDate,
        MOMENT().format('YYYY-MM-DD'),
        remark,
      ]);

    await originalExcel.xlsx.writeFile(`${path}/wishList.xlsx`);

}
