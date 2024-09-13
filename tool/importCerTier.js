
const Query = require("../mysql_query");


let certificationtierList=[
    "Tier I Certification of Constructed Facility",
    "Tier II Certification of Constructed Facility",
    "Tier III Certification of Constructed Facility",
    "Tier IV Certitication of Constructed Facility",
    "Tier I Certification of Design Documents",
    "Tier II Certification of Design Documents",
    "Tier III Certification of Design Documents",
    "Tier IV Certification of Design Documents",
    "Tier I Bronze Certication of Operational Sustainability",
    "Tier II Bronze Certification of Operational Sustainability",
    "Tier III Bronze Certification of Operational Sustainability",
    "Tier IV Bronze Certication of Operational Sustainability",
    "Tier I Silver Certifcation of Operational Sustainability",
    "Tier II Silver Certication of Operational Sustainability",
    "Tier III Silver Cerification of Operational Sustainability",
    "Tier IV Silver Certification of Operational Sustainability",
    "Tier I Gold Certification of Operational Sustainability",
    "Tier II Gold Certification of Operational stainability",
    "Tier III Gold Certication of Operational Sustainability",
    "Tier IV Gold Certication of Operational Sustainability",
    "M&O Stamp Of Approval"
]

let certificationISOList=[
    "ISO27001",
    "ISO9001",
    "ISO14001",
    "ISO50001",
    "ISO22237",
    "ISO20000-1",
    "ISO22301",
    "ISO27018",
    "ISO27017",
    "ISO27035",
    "ISOCAS STAR",
    "EEWH-Green Building Certification",
    "ISO45001",
    "SOC2",
    "PCI-DSS",
    "GreenGrid PUE Silver",
    "ISO27011",
]

async function importcertificationtier(certificationtier){
    for(let i=0 ;i<certificationtier.length ; i++){
        await Query("insert into certificationTier (name) values(?)",[certificationtier[i]])
    }
}

async function certificationISO(certificationISO){
    for(let i=0 ; i<certificationISO.length ; i++){
        await Query("insert into certificationISO (name) values(?)",[certificationISO[i]])
    }
}

async function run(){
    await importcertificationtier(certificationtierList);
    await certificationISO(certificationISOList);
}

//run()


