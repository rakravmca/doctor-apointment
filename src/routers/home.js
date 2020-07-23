const express = require('express')
const router = express.Router();
//const axios = require('axios');
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const Appointment = require('../models/Appointment')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const utils = require('util')
const puppeteer = require('puppeteer')
const hb = require('handlebars')
const fs = require('fs')
const path = require('path')

const readFile = utils.promisify(fs.readFile)

hb.registerHelper('dateFormat', function (date, format) {
  return moment(date).format(format);
});

router.get('', auth, async (req, res)=>{

  if(req.doctor){
    var totalAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id
      });

    var now = new Date();
    now.setHours(0,0,0,0);
    var openAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Open',
        appointment_date : {
          $gte: now
        }
      });
    
    var now = new Date();
    now.setHours(0,0,0,0);
    var cancelledAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Cancelled'
      });
    
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var closedAppointmentCount =  await Appointment.countDocuments(
      {
        doctor : req.doctor._id, 
        appointment_status : 'Closed',
        appointment_date : {
          $lte: pastDate
        }
      });

    res.render('doctor-home',  
    { 
      layout: 'main', 
      title : 'Dashboard',
      user : req.user.toJSON(),
      is_doctor: req.doctor != null,
      total : totalAppointmentCount,
      open : openAppointmentCount,
      closed:closedAppointmentCount,
      cancelled:cancelledAppointmentCount
    });
  }
  else{
    var totalAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id
      });

    var now = new Date();
    now.setHours(0,0,0,0);
    var openAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Open',
        appointment_date : {
          $gte: now
        }
      });
    
    var now = new Date();
    now.setHours(0,0,0,0);
    var cancelledAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Cancelled'
      });
    
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
    var closedAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Closed',
        appointment_date : {
          $lte: pastDate
        }
      });
      
    var notAttendedAppointmentCount =  await Appointment.countDocuments(
      {
        creater : req.user._id, 
        appointment_status : 'Open',
        appointment_date : {
          $lte: pastDate
        }
      });

    res.render('home',  
    { 
      layout: 'main', 
      title : 'Dashboard',
      user : req.user.toJSON(),
      total : totalAppointmentCount,
      open : openAppointmentCount,
      closed:closedAppointmentCount,
      cancelled:cancelledAppointmentCount,
      notAttended : notAttendedAppointmentCount
    });
  }
    
});

router.get('/reports', auth, async (req, res)=>{  
    res.render('reports',  
    { 
      layout: 'main', 
      title : 'Reports',
      user : req.user.toJSON(),
       is_doctor: req.doctor != null,
    });
});

router.get('/reports/patient', auth, async (req, res)=>{  
  res.render('patient-reports',  
  { 
    layout: 'main', 
    title : 'Reports',
    user : req.user.toJSON(),
    is_doctor: req.doctor != null,
  });
});

router.post('/reports/create', auth, async (req, res)=>{  
    let {reportType, startDate, endDate, statuses} = req.body;
    let data = {};
    let startDt = null;
    let endDt = null;

    if(!statuses){
      statuses = ['Open','Closed','Cancelled'];
    }

    console.log(startDate)

    if(startDate){
      startDt = new Date(startDate);
      startDt.setHours(0,0,0,0);
    }

    if(startDate){
      endDt = new Date(endDate);
      endDt.setHours(0,0,0,0);
    }
    
    let now = new Date();
    now.setHours(0,0,0,0);  

    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    pastDate.setHours(0,0,0,0);
        
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    nextDate.setHours(0,0,0,0);    

    let todayDateFilter = {};
    let pastDateFilter = {};
    let futureDateFilter ={};

    todayDateFilter = {
      $gte: now,
      $lte: now
    };

    if(startDt != null){
      if(endDt != null && endDt.getTime() > pastDate.getTime()){
        pastDateFilter = {
          $gte: startDt,
          $lte: pastDate
        };
      }
      else{
        pastDateFilter = {
          $gte: startDt,
          $lte: endDt
        };
      }
    }
    else{
      pastDateFilter = {
        $lte: pastDate
      };
    }
    
    if(endDt != null){
      if(startDt != null && startDt.getTime() < nextDate.getTime()){
        futureDateFilter = {
          $gte: nextDate,
          $lte: endDt
        };
      }
      else{
        futureDateFilter = {
          $gte: startDt,
          $lte: endDt
        };
      }
    }
    else{
      futureDateFilter = {
        $gte: nextDate
      };
    }

    if(reportType == 'appointments'){
        let todayAppointment =  await Appointment.find(
          {
            creater : req.user._id, 
            appointment_date : todayDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

        let todayAppt = [];
        for(let i=0;i<todayAppointment.length;i++){
            todayAppt.push(todayAppointment[i].toJSON())
        }

        let pastAppointment =  await Appointment.find(
          {
            creater : req.user._id, 
            appointment_date : pastDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });  

        let pastAppt = [];
        for(let i=0;i<pastAppointment.length;i++){
            pastAppt.push(pastAppointment[i].toJSON())
        }

        let futureAppointment =  await Appointment.find(
          {
            creater : req.user._id, 
            appointment_date : futureDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

        let futureAppt = [];
        for(let i=0;i<futureAppointment.length;i++){
            futureAppt.push(futureAppointment[i].toJSON())
        }
    
      data = {
        todayAppointments : todayAppt,
        pastAppointments : pastAppt,
        futureAppointments : futureAppt
      };
    }
    else if(reportType == 'patient-appointments'){
        var todayAppointment =  await Appointment.find(
          {
            doctor : req.doctor._id, 
            appointment_date : todayDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

        let todayAppt = [];
        for(let i=0;i<todayAppointment.length;i++){
            todayAppt.push(todayAppointment[i].toJSON())
        }

        var pastAppointment =  await Appointment.find(
          {
            doctor : req.doctor._id, 
            appointment_date : pastDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });  

        let pastAppt = [];
        for(let i=0;i<pastAppointment.length;i++){
            pastAppt.push(pastAppointment[i].toJSON())
        }

        var futureAppointment =  await Appointment.find(
          {
            doctor : req.doctor._id, 
            appointment_date : futureDateFilter,
            appointment_status : { $in: statuses }
          }).sort({appointment_date: 1})
        .populate({ path: 'doctor', select: 'name specialist appointment_slot_time' });

        let futureAppt = [];
        for(let i=0;i<futureAppointment.length;i++){
            futureAppt.push(futureAppointment[i].toJSON())
        }
    
      data = {
        todayAppointments : todayAppt,
        pastAppointments : pastAppt,
        futureAppointments : futureAppt
      };
    }

  let outputFileName = reportType + '.pdf';
  let outputDir = 'src/public/output';
  let templateDir = 'src/public/templates';
  let templateFileName = reportType + '.html';

  getTemplateHtml(templateDir + '/' + templateFileName).then(async (tmplHtml) => {
    // Now we have the html code of our template in res object
    // you can check by logging it on console
    // console.log(res)
    console.log("Compiing the template with handlebars")
    const template = hb.compile(tmplHtml, { strict: true });
    // we have compile our code with handlebars
    const result = template(data);
    // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
    const html = result;
    // we are using headless mode
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    // We set the page content as the generated html by handlebars
    await page.setContent(html)

    if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir);
    }

    // We use pdf function to generate the pdf in the same folder as this file.
    await page.pdf({ path: outputDir + '/' + outputFileName, format: 'A4' })
    await browser.close();
    console.log("PDF Generated")
    res.json({fileName: outputFileName});
  }).catch(err => {
    console.error(err)
    res.json({fileName: ''});
  });
});

async function getTemplateHtml(templatePath) {
  console.log("Loading template file in memory")
  try {
    const invoicePath = path.resolve(templatePath);
    //console.log(invoicePath);
    return await readFile(invoicePath, 'utf8');
  } catch (err) {
    return Promise.reject("Could not load html template");
  }
}

async function generatePdf() {
  let data = {};
  getTemplateHtml().then(async (res) => {
    // Now we have the html code of our template in res object
    // you can check by logging it on console
    // console.log(res)
    console.log("Compiing the template with handlebars")
    const template = hb.compile(res, { strict: true });
    // we have compile our code with handlebars
    const result = template(data);
    // We can use this to add dyamic data to our handlebas template at run time from database or API as per need. you can read the official doc to learn more https://handlebarsjs.com/
    const html = result;
    // we are using headless mode
    const browser = await puppeteer.launch();
    const page = await browser.newPage()
    // We set the page content as the generated html by handlebars
    await page.setContent(html)
    // We use pdf function to generate the pdf in the same folder as this file.
    await page.pdf({ path: 'src/public/output/invoice.pdf', format: 'A4' })
    await browser.close();
    console.log("PDF Generated")
    return 'invoice.pdf';
  }).catch(err => {
    console.error(err)
    return '';
  });
}


module.exports = router;