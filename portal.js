const commonFunction = require('./function/common');
const accountFunction = require('./function/account');
const idcFunction = require('./function/idcInfo');
const MOMENT = require('moment');
var express = require('express');
const bodyParser = require('body-parser');
let engine = require('ejs-locals');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var alert = require('alert');
var app = express();
const FS = require('fs');
const { resourceLimits } = require('worker_threads');
app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'idcwebsite',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));

async function clearIdcInfoCookie(res){
  res.clearCookie("powerPrice_KW_Hour");
  res.clearCookie("powerPrice_KW_Month");
  res.clearCookie("powerAvail_MW");
  res.clearCookie("price_AllIn");
  res.clearCookie("rackAvail");
  res.clearCookie("region");
  res.clearCookie("country");
}
// sellingChannel 
//API = 1 -> 用套餐計費
//API = 2 -> 用流量計費

//Loing page
//Clear cookie 
app.get('/idcwebsite', async function (req, res) {
  req.session.destroy();

  res.clearCookie("account");
  res.clearCookie("accountLevel");
  res.clearCookie("account_changePasswordResult");

  //show info
  res.clearCookie("powerPrice_KW_Hour");
  res.clearCookie("powerPrice_KW_Month");
  res.clearCookie("powerAvail_MW");
  res.clearCookie("price_AllIn");
  res.clearCookie("rackAvail");
  res.clearCookie("region");
  res.clearCookie("country");

  //modify info
  res.clearCookie("dataCenterId");
  res.clearCookie("certificationTier_modify");
  res.clearCookie("certificationISO_modify");
  res.clearCookie("powerTotal_MW_modify");
  res.clearCookie("powerAvail_MW_modify");
  res.clearCookie("upsOutageSustain_min_modify");
  res.clearCookie("potentExpanPower_MW_modify");
  res.clearCookie("powerPrice_KW_Hour_modify");
  res.clearCookie("powerPrice_KW_Month_modify");
  res.clearCookie("spacePrice_KW_modify");
  res.clearCookie("price_AllIn_modify");
  res.clearCookie("rackMRC_modify");
  res.clearCookie("priceMRC_modify");
  res.clearCookie("pricePerKWh_modify");
  res.clearCookie("rackMax_KW_LC_modify");
  res.clearCookie("rackMax_KW_AC_modify");
  res.clearCookie("PUE_modify");
  res.clearCookie("rackTotal_modify");
  res.clearCookie("rackAvail_modify");
  res.clearCookie("powerDualSupply_modify");
  res.clearCookie("nPlusOneBackUp_modify");
  res.clearCookie("fuelTankCap_Liters_modify");
  res.clearCookie("fuelTankCap_hour_modify");
  res.clearCookie("fiberDualEntry_modify");
  res.clearCookie("potentExpan_modify");
  res.clearCookie("liquidCoolingReady_modify");
  res.clearCookie("liquidCoolingReadyDate_modify");
  res.clearCookie("potentExpanDate_modify");
  res.clearCookie("minContractTerm_modify");
  res.clearCookie("reservationRequirement_modify");
  res.clearCookie("notes_modify");
  res.clearCookie("changeApproval");
  res.clearCookie("dataCenterOner");
  res.clearCookie("vocomContactName");
  res.clearCookie("remark");
  res.clearCookie("approval");

  //wishList
  res.clearCookie("location_wishList");
  res.clearCookie("powerAvail_MW_wishList");
  res.clearCookie("powerPrice_KW_Hour_wishList");
  res.clearCookie("spacePrice_KW_wishList");
  res.clearCookie("rackMax_KW_wishList");
  res.clearCookie("liquidCoolingReady_wishList");
  res.clearCookie("deploymentDate_wishList");
  res.clearCookie("remark_wishList");

  res.render('login');
});

app.post('/idcwebsite', async function (req, res) {
  //initailize cookie
  res.cookie('account', req.body.account);
  res.cookie('lastActivity', Date.now());
  req.session.account = req.body.account;
  let accountCertification = 0;
  let accountInfo = 0;
  const pattern = /[!@#$%^&*()+{}:><?,./;]/;
  if (!req.body.account.match(pattern) && !req.body.passWord.match(pattern)) {
    //check account and password
    accountCertification = await commonFunction.checkAccount(req.body.account, req.body.passWord);
  }
  
  if (accountCertification) {
    accountInfo = await commonFunction.getAccountInfo(req.body.account);
    res.cookie('accountLevel', accountInfo[0].level);
    res.redirect('/idcwebsite/main');
  } else {
    res.redirect('/idcwebsite/loginfail');
  }
})

//loginfail Page
app.get('/idcwebsite/loginfail', async function (req, res) {
  res.render('loginfail');
});

//account Page
app.get('/idcwebsite/account', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    //get information from cookie
    await clearIdcInfoCookie(res)
    res.locals.accountLevel = req.cookies.accountLevel ? req.cookies.accountLevel : 3;
    res.locals.account_changePasswordResult = req.cookies.account_changePasswordResult ? req.cookies.account_changePasswordResult : '-1';
    if (res.locals.account_changePasswordResult == 0) {
      // alert('You had successfully change your password, please login again!');
      res.redirect('/idcwebsite');
    } else {
      res.locals.account = req.cookies.account;
      res.render('account');
    }
  } else {
    res.redirect('/idcwebsite');
  }
})

//account Page for update password
app.post('/idcwebsite/account', async function (req, res) {
  if (req.cookies.account) {
    //get parameter from post, write into cookie
    res.locals.account = req.cookies.account;
    res.locals.account_oldPassword = req.body.account_oldPassword ? req.body.account_oldPassword : '-1';
    res.locals.account_newPassword = req.body.account_newPassword ? req.body.account_newPassword : '-1';
    res.locals.account_confirmPassword = req.body.account_confirmPassword ? req.body.account_confirmPassword : '-1';

    let result = await accountFunction.account_checkpassword(req.cookies.account, res.locals.account_oldPassword, res.locals.account_newPassword, res.locals.account_confirmPassword);
    res.cookie('account_changePasswordResult', result);
    res.redirect('/idcwebsite/account');
  } else {
    res.redirect('/idcwebsite');
  }
})

//main page
app.get('/idcwebsite/main', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    res.locals.account = req.cookies.account;
    res.locals.accountLevel = req.cookies.accountLevel ? req.cookies.accountLevel : 3;
    res.render("main");
  } else {
    res.redirect('/idcwebsite');
  }
})

app.get('/idcwebsite/idcInfo', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    res.locals.account = req.cookies.account;
    res.locals.accountLevel = req.cookies.accountLevel ? req.cookies.accountLevel : 3;
    res.locals.powerPrice_KW_Hour = req.cookies.powerPrice_KW_Hour ? req.cookies.powerPrice_KW_Hour : "0,999";
    res.locals.powerPrice_KW_Month = req.cookies.powerPrice_KW_Month ? req.cookies.powerPrice_KW_Month : "0,999";
    res.locals.price_AllIn = req.cookies.price_AllIn ? req.cookies.price_AllIn : "0,999";
    res.locals.powerAvail_MW = req.cookies.powerAvail_MW ? req.cookies.powerAvail_MW : '0,999';
    res.locals.rackAvail = req.cookies.rackAvail ? req.cookies.rackAvail : "0,9999";
    res.locals.region = req.cookies.region ? req.cookies.region : -1;
    res.locals.country = req.cookies.country ? req.cookies.country : -1;
    res.locals.flag = 1;
     
    let idc_info = await idcFunction.getIdc_Info(res.locals.powerPrice_KW_Hour, res.locals.powerPrice_KW_Month, res.locals.price_AllIn, res.locals.powerAvail_MW, res.locals.rackAvail, res.locals.region, res.locals.country);
    res.locals.idc_info = idc_info;
 
    
    
    let RegionList = await idcFunction.getRegionList();
    res.locals.RegionList = RegionList;
    let countryList  = await idcFunction.getCountryList();
    res.locals.countryList = countryList;
    
    if(!idc_info.length){
      //error message
      res.locals.flag = 0;
      res.render("idcInfo");
    }else{
      res.locals.idc_info = idc_info;
      res.render("idcInfo");
    }
  } else {
    res.redirect('/idcwebsite');
  }
})

app.post('/idcwebsite/idcInfo', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    //get parameter from post, write into cookie
    if (req.body.powerPrice_KW_Hour) {
      res.cookie('powerPrice_KW_Hour', req.body.powerPrice_KW_Hour);
    }
    
    if (req.body.powerPrice_KW_Month) {
      res.cookie('powerPrice_KW_Month', req.body.powerPrice_KW_Month);
    }
    
    if (req.body.powerAvail_MW) {
      res.cookie('powerAvail_MW', req.body.powerAvail_MW);
    }

    if (req.body.price_AllIn) {
      res.cookie('price_AllIn', req.body.price_AllIn);
    }

    if (req.body.rackAvail){
      res.cookie('rackAvail', req.body.rackAvail);
    }

    if (req.body.region){
      res.cookie('region', req.body.region);
    }

    if (req.body.country){
      res.cookie('country', req.body.country);
    }

    res.redirect('/idcwebsite/idcInfo');
  } else {
    res.redirect('/idcwebsite');
  }
})

app.get('/idcwebsite/wishList', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    await clearIdcInfoCookie(res)
    res.locals.account = req.cookies.account;
    res.locals.accountLevel = req.cookies.accountLevel ? req.cookies.accountLevel : 3;
    res.locals.location_wishList = req.cookies.location_wishList ? req.cookies.location_wishList :0;
    res.locals.powerAvail_MW_wishList = req.cookies.powerAvail_MW_wishList ? req.cookies.powerAvail_MW_wishList : 0;
    res.locals.powerPrice_KW_Hour_wishList = req.cookies.powerPrice_KW_Hour_wishList ? req.cookies.powerPrice_KW_Hour_wishList : 0;
    res.locals.spacePrice_KW_wishList = req.cookies.spacePrice_KW_wishList ? req.cookies.spacePrice_KW_wishList : 0;
    res.locals.rackMax_KW_wishList = req.cookies.rackMax_KW_wishList ? req.cookies.rackMax_KW_wishList : 0;
    res.locals.liquidCoolingReady_wishList = req.cookies.liquidCoolingReady_wishList ? req.cookies.liquidCoolingReady_wishList : '0';
    res.locals.deploymentDate_wishList = req.cookies.deploymentDate_wishList ? req.cookies.deploymentDate_wishList : 0;
    res.locals.remark_wishList = req.cookies.remark_wishList ? req.cookies.remark_wishList : 0;
    
    res.locals.flag = 0;
    let dateList = await idcFunction.getDateList();
    res.locals.dateList = dateList;

    if(res.locals.powerAvail_MW_wishList != 0){
      res.locals.flag = await idcFunction.mailWishList(
                            res.locals.account,
                            res.locals.location_wishList,
                            res.locals.powerAvail_MW_wishList,
                            res.locals.powerPrice_KW_Hour_wishList,
                            res.locals.spacePrice_KW_wishList,
                            res.locals.rackMax_KW_wishList,
                            res.locals.liquidCoolingReady_wishList,
                            res.locals.deploymentDate_wishList,
                            res.locals.remark_wishList
                        );
      res.clearCookie("location_wishList");
      res.clearCookie("powerAvail_MW_wishList");
      res.clearCookie("powerPrice_KW_Hour_wishList");
      res.clearCookie("spacePrice_KW_wishList");
      res.clearCookie("rackMax_KW_wishList");
      res.clearCookie("liquidCoolingReady_wishList");
      res.clearCookie("deploymentDate_wishList");
      res.clearCookie("remark_wishList");
    }
    
    
    res.render("wishList");
  } else {
    res.redirect('/idcwebsite');
  }
})

app.post('/idcwebsite/wishList', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    //get parameter from post, write into cookie
    if (req.body.location_wishList) {
      res.cookie('location_wishList', req.body.location_wishList);
    }else{
      res.clearCookie("location_wishList");
    }

    if (req.body.powerAvail_MW_wishList) {
      res.cookie('powerAvail_MW_wishList', req.body.powerAvail_MW_wishList);
    }else{
      res.clearCookie("powerAvail_MW_wishList");
    }

    if (req.body.powerPrice_KW_Hour_wishList){
      res.cookie('powerPrice_KW_Hour_wishList', req.body.powerPrice_KW_Hour_wishList);
    }else{
      res.clearCookie("powerPrice_KW_Hour_wishList");
    }

    if (req.body.spacePrice_KW_wishList){
      res.cookie('spacePrice_KW_wishList', req.body.spacePrice_KW_wishList);
    }else{
      res.clearCookie("spacePrice_KW_wishList");
    }

    if (req.body.rackMax_KW_wishList){
      res.cookie('rackMax_KW_wishList', req.body.rackMax_KW_wishList);
    }else{
      res.clearCookie("rackMax_KW_wishList");
    }

    if (req.body.liquidCoolingReady_wishList){
      res.cookie('liquidCoolingReady_wishList', req.body.liquidCoolingReady_wishList);
    }else{
      res.clearCookie("liquidCoolingReady_wishList");
    }

    if (req.body.deploymentDate_wishList){
      res.cookie('deploymentDate_wishList', req.body.deploymentDate_wishList);
    }else{
      res.clearCookie("deploymentDate_wishList");
    }

    if (req.body.remark_wishList){
      res.cookie('remark_wishList', req.body.remark_wishList);
    }else{
      res.clearCookie("remark_wishList");
    }

    res.redirect('/idcwebsite/wishList');
  } else {
    res.redirect('/idcwebsite');
  }
})

app.get('/idcwebsite/modifyIdcInfo', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    await clearIdcInfoCookie(res)
    res.locals.account = req.cookies.account;
    res.locals.accountLevel = req.cookies.accountLevel ? req.cookies.accountLevel : 2;
    res.locals.error = 0;
    //filter
    res.locals.dataCenterId = req.cookies.dataCenterId ? req.cookies.dataCenterId : 0;
    //filter for idcList
    res.locals.dataCenterOner = req.cookies.dataCenterOner ? req.cookies.dataCenterOner : 0;
    res.locals.vocomContactName = req.cookies.vocomContactName ? req.cookies.vocomContactName : 0;
    res.locals.remark = req.cookies.remark ? req.cookies.remark : 0;
    res.locals.approval = req.cookies.approval ? req.cookies.approval : 0;
    //modify data
    //multiple selection
    res.locals.certificationTier_modify = req.cookies.certificationTier_modify ? req.cookies.certificationTier_modify : -1;
    res.locals.certificationISO_modify = req.cookies.certificationISO_modify ? req.cookies.certificationISO_modify : -1;
    //number
    res.locals.powerTotal_MW_modify = req.cookies.powerTotal_MW_modify ? req.cookies.powerTotal_MW_modify : -1;
    res.locals.powerAvail_MW_modify = req.cookies.powerAvail_MW_modify ? req.cookies.powerAvail_MW_modify : -1;
    res.locals.fuelTankCap_Liters_modify = req.cookies.fuelTankCap_Liters_modify ? req.cookies.fuelTankCap_Liters_modify : -1;
    res.locals.fuelTankCap_hour_modify = req.cookies.fuelTankCap_hour_modify ? req.cookies.fuelTankCap_hour_modify : -1;
    res.locals.upsOutageSustain_min_modify = req.cookies.upsOutageSustain_min_modify ? req.cookies.upsOutageSustain_min_modify : -1;
    res.locals.potentExpanPower_MW_modify = req.cookies.potentExpanPower_MW_modify ? req.cookies.potentExpanPower_MW_modify : -1;
    res.locals.powerPrice_KW_Hour_modify = req.cookies.powerPrice_KW_Hour_modify ? req.cookies.powerPrice_KW_Hour_modify : -1;
    res.locals.powerPrice_KW_Month_modify = req.cookies.powerPrice_KW_Month_modify ? req.cookies.powerPrice_KW_Month_modify : -1;
    res.locals.spacePrice_KW_modify = req.cookies.spacePrice_KW_modify ? req.cookies.spacePrice_KW_modify : -1;
    res.locals.price_AllIn_modify = req.cookies.price_AllIn_modify ? req.cookies.price_AllIn_modify : -1;
    res.locals.rackMRC_modify = req.cookies.rackMRC_modify ? req.cookies.rackMRC_modify : -1;
    res.locals.priceMRC_modify = req.cookies.priceMRC_modify ? req.cookies.priceMRC_modify : -1;
    res.locals.pricePerKWh_modify = req.cookies.pricePerKWh_modify ? req.cookies.pricePerKWh_modify : -1;
    res.locals.rackMax_KW_LC_modify = req.cookies.rackMax_KW_LC_modify ? req.cookies.rackMax_KW_LC_modify : -1;
    res.locals.rackMax_KW_AC_modify = req.cookies.rackMax_KW_AC_modify ? req.cookies.rackMax_KW_AC_modify : -1;
    res.locals.PUE_modify = req.cookies.PUE_modify ? req.cookies.PUE_modify : -1;
    res.locals.rackTotal_modify = req.cookies.rackTotal_modify ? req.cookies.rackTotal_modify : -1;
    res.locals.rackAvail_modify = req.cookies.rackAvail_modify ? req.cookies.rackAvail_modify : -1;
    res.locals.minContractTerm_modify = req.cookies.minContractTerm_modify ? req.cookies.minContractTerm_modify : -1;
    res.locals.reservationRequirement_modify = req.cookies.reservationRequirement_modify ? req.cookies.reservationRequirement_modify : -1;
    //enum(1,0,-1) -> selection
    res.locals.powerDualSupply_modify = req.cookies.powerDualSupply_modify ? req.cookies.powerDualSupply_modify : -2;
    res.locals.nPlusOneBackUp_modify = req.cookies.nPlusOneBackUp_modify ? req.cookies.nPlusOneBackUp_modify : -2;
    res.locals.fiberDualEntry_modify = req.cookies.fiberDualEntry_modify ? req.cookies.fiberDualEntry_modify : -2;
    res.locals.potentExpan_modify = req.cookies.potentExpan_modify ? req.cookies.potentExpan_modify : -2;
    res.locals.liquidCoolingReady_modify = req.cookies.liquidCoolingReady_modify ? req.cookies.liquidCoolingReady_modify : -2;
    
    //selection
    res.locals.potentExpanDate_modify = req.cookies.potentExpanDate_modify ? req.cookies.potentExpanDate_modify : -1;
    res.locals.liquidCoolingReadyDate_modify = req.cookies.liquidCoolingReadyDate_modify ? req.cookies.liquidCoolingReadyDate_modify : -1;
    //text
    res.locals.notes_modify = req.cookies.notes_modify ? req.cookies.notes_modify : '';

    res.locals.changeApproval = req.cookies.changeApproval ? req.cookies.changeApproval : '';

    if(res.locals.changeApproval){
      await idcFunction.updateApproval(res.locals.account,res.locals.changeApproval);
    }

    res.locals.idcList;
    let idcList = await idcFunction.getIdcList(res.locals.account, res.locals.accountLevel, res.locals.dataCenterOner, res.locals.vocomContactName, res.locals.remark, res.locals.approval);
    res.locals.idcList = idcList;

    let certificationTierList = await idcFunction.getCertificationTier();
    res.locals.certificationTierList = certificationTierList;

    let certificationISOList = await idcFunction.getCertificationISO();
    res.locals.certificationISOList = certificationISOList;

    let dateList = await idcFunction.getDateList();
    res.locals.dateList = dateList;
    
    let idcPartnerList = await idcFunction.getIdcPartnerList(res.locals.account, res.locals.accountLevel);
    res.locals.idcPartnerList = idcPartnerList
    let idcManagerList = await idcFunction.getIdcManagerList();
    res.locals.idcManagerList = idcManagerList

    //應急處理 之後要改
    if(!res.locals.dataCenterId){
      if(idcList.length){
        res.locals.dataCenterId = idcList[0].dataCenterId
        res.cookie('dataCenterId', res.locals.dataCenterId);
      }else{
        res.locals.dataCenterId = 'Minnesota1'
      }
      
    }
    
    let idcinfoupdate = await idcFunction.updateIDCinfo(
      res.locals.account,
      res.locals.dataCenterId,
      res.locals.certificationTier_modify,
      res.locals.certificationISO_modify,
      res.locals.powerTotal_MW_modify,
      res.locals.powerAvail_MW_modify,
      res.locals.upsOutageSustain_min_modify,
      res.locals.potentExpanPower_MW_modify,
      res.locals.powerPrice_KW_Hour_modify,
      res.locals.powerPrice_KW_Month_modify,
      res.locals.spacePrice_KW_modify,
      res.locals.price_AllIn_modify,
      res.locals.rackMRC_modify,
      res.locals.priceMRC_modify,
      res.locals.pricePerKWh_modify,
      res.locals.rackMax_KW_LC_modify,
      res.locals.rackMax_KW_AC_modify,
      res.locals.PUE_modify,
      res.locals.rackTotal_modify,
      res.locals.rackAvail_modify,
      res.locals.minContractTerm_modify,
      res.locals.powerDualSupply_modify,
      res.locals.nPlusOneBackUp_modify,
      res.locals.fuelTankCap_Liters_modify,
      res.locals.fuelTankCap_hour_modify,
      res.locals.fiberDualEntry_modify,
      res.locals.potentExpan_modify,
      res.locals.liquidCoolingReady_modify,
      res.locals.reservationRequirement_modify,
      res.locals.potentExpanDate_modify,
      res.locals.liquidCoolingReadyDate_modify,
      res.locals.notes_modify
    )

    if(!idcinfoupdate){
      res.locals.error = 1;
    }


    if(res.locals.accountLevel == 3){
      res.redirect('/idcwebsite');
    }else{
      let idcDetail = await idcFunction.getIdcDetail(res.locals.dataCenterId)
      res.locals.idcDetail = idcDetail;

      res.clearCookie("certificationTier_modify");
      res.clearCookie("certificationISO_modify");
      res.clearCookie("powerTotal_MW_modify");
      res.clearCookie("powerAvail_MW_modify");
      res.clearCookie("upsOutageSustain_min_modify");
      res.clearCookie("potentExpanPower_MW_modify");
      res.clearCookie("powerPrice_KW_Hour_modify");
      res.clearCookie("powerPrice_KW_Month_modify");
      res.clearCookie("spacePrice_KW_modify");
      res.clearCookie("price_AllIn_modify");
      res.clearCookie("rackMRC_modify");
      res.clearCookie("priceMRC_modify");
      res.clearCookie("pricePerKWh_modify");
      res.clearCookie("rackMax_KW_LC_modify");
      res.clearCookie("rackMax_KW_AC_modify");
      res.clearCookie("PUE_modify");
      res.clearCookie("rackTotal_modify");
      res.clearCookie("rackAvail_modify");
      res.clearCookie("powerDualSupply_modify");
      res.clearCookie("nPlusOneBackUp_modify");
      res.clearCookie("fuelTankCap_Liters_modify");
      res.clearCookie("fuelTankCap_hour_modify");
      res.clearCookie("fiberDualEntry_modify");
      res.clearCookie("potentExpan_modify");
      res.clearCookie("liquidCoolingReady_modify");
      res.clearCookie("liquidCoolingReadyDate_modify");
      res.clearCookie("potentExpanDate_modify");
      res.clearCookie("notes_modify");
      res.clearCookie("changeApproval");
      res.render("modifyIdcInfo");
    }
  } else {
    res.redirect('/idcwebsite');
  }
})

app.post('/idcwebsite/modifyIdcInfo', async function (req, res) {
  //check user login informaion, if not login send back to login page
  if (req.cookies.account) {
    //idc filter
    if (req.body.dataCenterOner) {
      res.cookie('dataCenterOner', req.body.dataCenterOner);
    }else{
      res.clearCookie("dataCenterOner");
    }

    if (req.body.vocomContactName) {
      res.cookie('vocomContactName', req.body.vocomContactName);
    }else{
      res.clearCookie("vocomContactName");
    }

    if (req.body.remark) {
      res.cookie('remark', req.body.remark);
    }else{
      res.clearCookie("remark");
    }

    if (req.body.approval) {
      res.cookie('approval', req.body.approval);
    }else{
      res.clearCookie("approval");
    }

    if (req.body.changeApproval) {
      res.cookie('changeApproval', req.body.changeApproval);
    }else{
      res.clearCookie("changeApproval");
    }

    //get parameter from post, write into cookie, modify idc infromation
    if (req.body.dataCenterId) {
      res.cookie('dataCenterId', req.body.dataCenterId);
    }

    if (req.body.certificationTier_modify) {
      res.cookie('certificationTier_modify', req.body.certificationTier_modify);
    }else{
      res.clearCookie("certificationTier_modify");
    }

    if (req.body.certificationISO_modify) {
      res.cookie('certificationISO_modify', req.body.certificationISO_modify);
    }else{
      res.clearCookie("certificationISO_modify");
    }

    if (req.body.powerTotal_MW_modify) {
      res.cookie('powerTotal_MW_modify', req.body.powerTotal_MW_modify);
    }else{
      res.clearCookie("powerTotal_MW_modify");
    }

    if (req.body.powerAvail_MW_modify) {
      res.cookie('powerAvail_MW_modify', req.body.powerAvail_MW_modify);
    }else{
      res.clearCookie("powerAvail_MW_modify");
    }
    
    if (req.body.powerDualSupply_modify) {
      res.cookie('powerDualSupply_modify', req.body.powerDualSupply_modify);
    }else{
      res.clearCookie("powerDualSupply_modify");
    }
    
    if (req.body.nPlusOneBackUp_modify) {
      res.cookie('nPlusOneBackUp_modify', req.body.nPlusOneBackUp_modify);
    }else{
      res.clearCookie("nPlusOneBackUp_modify");
    }

    if (req.body.fuelTankCap_Liters_modify) {
      res.cookie('fuelTankCap_Liters_modify', req.body.fuelTankCap_Liters_modify);
    }else{
      res.clearCookie("fuelTankCap_Liters_modify");
    }

    if (req.body.fuelTankCap_hour_modify) {
      res.cookie('fuelTankCap_hour_modify', req.body.fuelTankCap_hour_modify);
    }else{
      res.clearCookie("fuelTankCap_hour_modify");
    }
    
    if (req.body.upsOutageSustain_min_modify) {
      res.cookie('upsOutageSustain_min_modify', req.body.upsOutageSustain_min_modify);
    }else{
      res.clearCookie("upsOutageSustain_min_modify");
    }

    if (req.body.fiberDualEntry_modify) {
      res.cookie('fiberDualEntry_modify', req.body.fiberDualEntry_modify);
    }else{
      res.clearCookie("fiberDualEntry_modify");
    }
    
    if (req.body.potentExpan_modify) {
      res.cookie('potentExpan_modify', req.body.potentExpan_modify);
    }else{
      res.clearCookie("potentExpan_modify");
    }

    if (req.body.potentExpanDate_modify) {
      res.cookie('potentExpanDate_modify', req.body.potentExpanDate_modify);
    }else{
      res.clearCookie("potentExpanDate_modify");
    }

    if (req.body.potentExpanPower_MW_modify) {
      res.cookie('potentExpanPower_MW_modify', req.body.potentExpanPower_MW_modify);
    }else{
      res.clearCookie("potentExpanPower_MW_modify");
    }
    
    if (req.body.powerPrice_KW_Hour_modify) {
      res.cookie('powerPrice_KW_Hour_modify', req.body.powerPrice_KW_Hour_modify);
    }else{
      res.clearCookie("powerPrice_KW_Hour_modify");
    }

    if (req.body.powerPrice_KW_Month_modify) {
      res.cookie('powerPrice_KW_Month_modify', req.body.powerPrice_KW_Month_modify);
    }else{
      res.clearCookie("powerPrice_KW_Month_modify");
    }

    if (req.body.price_AllIn_modify) {
      res.cookie('price_AllIn_modify', req.body.price_AllIn_modify);
    }else{
      res.clearCookie("price_AllIn_modify");
    }
    
    if (req.body.spacePrice_KW_modify) {
      res.cookie('spacePrice_KW_modify', req.body.spacePrice_KW_modify);
    }else{
      res.clearCookie("spacePrice_KW_modify");
    }

    if (req.body.rackMRC_modify) {
      res.cookie('rackMRC_modify', req.body.rackMRC_modify);
    }else{
      res.clearCookie("rackMRC_modify");
    }
    
    if (req.body.priceMRC_modify) {
      res.cookie('priceMRC_modify', req.body.priceMRC_modify);
    }else{
      res.clearCookie("priceMRC_modify");
    }

    if (req.body.pricePerKWh_modify) {
      res.cookie('pricePerKWh_modify', req.body.pricePerKWh_modify);
    }else{
      res.clearCookie("pricePerKWh_modify");
    }

    if (req.body.rackMax_KW_LC_modify) {
      res.cookie('rackMax_KW_LC_modify', req.body.rackMax_KW_LC_modify);
    }else{
      res.clearCookie("rackMax_KW_LC_modify");
    }

    if (req.body.rackMax_KW_AC_modify) {
      res.cookie('rackMax_KW_AC_modify', req.body.rackMax_KW_AC_modify);
    }else{
      res.clearCookie("rackMax_KW_AC_modify");
    }

    if (req.body.PUE_modify) {
      res.cookie('PUE_modify', req.body.PUE_modify);
    }else{
      res.clearCookie("PUE_modify");
    }
    
    if (req.body.rackTotal_modify) {
      res.cookie('rackTotal_modify', req.body.rackTotal_modify);
    }else{
      res.clearCookie("rackTotal_modify");
    }

    if (req.body.rackAvail_modify) {
      res.cookie('rackAvail_modify', req.body.rackAvail_modify);
    }else{
      res.clearCookie("rackAvail_modify");
    }

    if (req.body.liquidCoolingReady_modify) {
      res.cookie('liquidCoolingReady_modify', req.body.liquidCoolingReady_modify);
    }else{
      res.clearCookie("liquidCoolingReady_modify");
    }

    if (req.body.liquidCoolingReadyDate_modify) {
      res.cookie('liquidCoolingReadyDate_modify', req.body.liquidCoolingReadyDate_modify);
    }else{
      res.clearCookie("liquidCoolingReadyDate_modify");
    }

    if (req.body.minContractTerm_modify) {
      res.cookie('minContractTerm_modify', req.body.minContractTerm_modify);
    }else{
      res.clearCookie("minContractTerm_modify");
    }

    if (req.body.reservationRequirement_modify) {
      res.cookie('reservationRequirement_modify', req.body.reservationRequirement_modify);
    }else{
      res.clearCookie("reservationRequirement_modify");
    }

    if (req.body.notes_modify) {
      res.cookie('notes_modify', req.body.notes_modify);
    }else{
      res.clearCookie("notes_modify");
    }
    
    res.redirect('/idcwebsite/modifyIdcInfo');
  } else {
    res.redirect('/idcwebsite');
  }
})

//logout
app.get('/idcwebsite/logout', async function (req, res) {
  req.session.destroy();
  res.redirect('/idcwebsite');
})

app.listen(4001, function () {
  console.log(`Example app listening on http://103.178.37.3:4001/idcwebsite`);
});