const PATH = require('path');
require('dotenv').config({ path: PATH.resolve(__dirname, './.env') });
const NODEMAILER = require('nodemailer');


/**
 * 
 * @param {Object} bodyObj { subject: String, to: String, text: String, attachments: [{ filename: string, path: full path with filename }], cc: string, bcc: string }
 */
function Mail(bodyObj, retrial) {
  if (!retrial) {
    retrial = 0;
  }
  let mailTransport = NODEMAILER.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.MAIL_ACCOUNT_Albert,
      pass: process.env.MAIL_PASSWORD_Albert
    },
    tls: {
      rejectUnauthorized: false,
    }
  });
  let from = 'albert@vocom.com';


  let message = {
    from: from,
    to: ``,
    subject: `Mail from VOCOM Albert!`,
    text: `Greetings,\r\n\r\nThis is Kevin from VOCOM.\r\n\r\nRegards,\r\nKevin`
  };
  if (bodyObj.cc) { message.cc = bodyObj.cc };
  if (bodyObj.bcc) { message.bcc = bodyObj.bcc };
  if (bodyObj.subject) { message.subject = bodyObj.subject };
  if (bodyObj.to) { message.to += `, ${bodyObj.to}` };
  if (bodyObj.text) { message.text = bodyObj.text };
  if (bodyObj.html) { message.html = bodyObj.html };
  if (bodyObj.attachments) { message.attachments = bodyObj.attachments };

  switch (true) {
    case ((/connection lost/i).test(message.text)): 
    case ((/Lock wait timeout/i).test(message.text)): {
      message.to += process.env.ERROR_LIST;
      break;
    }
    default:
      break;
  }
  
  setTimeout(() => {
    mailTransport.sendMail(message, function (err, info) {
      if (err) {
        if (retrial < 5) {
          retrial += 1;
          return Mail(bodyObj, retrial);
        }
        else {
          let errmsg = {
            from: from,
            to: `albert@vocom.com`,
            subject: `Mail sending ERROR from Main Server!!!!`,
            text: `Mail sending failure with message: ${JSON.stringify(message, null, 1)}\r\nERROR: ${err.message}\r\nStack: ${err.stack}`
          }
          mailTransport.sendMail(errmsg, function (err, info) {
            if (err) {
              console.log(`Failure ERROR Mail sending!!!!!!!!!\r\nError: ${err.message}\r\nStack: ${err.stack}`);
            }
          })
        }

      }
    })
  }, retrial * 500);
}

module.exports = Mail
