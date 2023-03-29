const express = require('express');
const bodyParser = require('body-parser');
const { DateTime } = require('luxon');
const { parse } = require('node-html-parser');
const { createWriteStream } = require('fs');
const { log } = require('./util/logger')

const app = express();

const xml_folder = 'files/unprocessed_xml/';
const xml_corrupt_folder = 'files/corrupted_xml/';

app.use(bodyParser.raw({ type: 'text/xml' }));

app.post('/', (req, res) => {
  const xml_post = req.body;
  res.status(200).set('Content-Type', 'text/xml').send('<DAS><result>SUCCESS</result></DAS>');
  const tree = parse(xml_post.toString(), {
    xmlMode: true,
    lowerCaseTags: false,
    errorHandler: () => {},
  });

  const is_log_file_upload = tree.querySelector('mode')?.textContent;
  if (is_log_file_upload !== 'LOGFILEUPLOAD') {
    return;
  }
  try {
    const serialNumber = tree.querySelector('serial')?.textContent;
    const address = tree.querySelector('address')?.textContent;
    const errorNumber = tree.querySelector('error')?.textContent;
    const errorText = tree.querySelector('error')?.getAttribute('text');
    const time_of_measurement = tree.querySelector('time')?.textContent;
    if (!serialNumber || !address || !errorNumber || !time_of_measurement) {
      console.log('Missing required element');
      return;
    }
    const date_obj = DateTime.fromFormat(time_of_measurement, 'yyyy-MM-dd HH:mm:ss');
    const file_datetime = date_obj.toFormat('yyyyMMdd_HHmmss');
    const date_received = DateTime.now().toFormat('yyyy-MM-dd_HH-mm-ss-fff');
    const filename = `${serialNumber}_${address}_${file_datetime}.xml`;
    const new_path = xml_folder + filename;
    const corr_path = xml_corrupt_folder + filename;
    if (errorNumber === '0') {
      log("AcquiSuite XML", "info", `${date_received}: ${serialNumber}_${address} || Error: ${errorNumber} || ErrorMsg: ${errorText}`);
      const file = createWriteStream(new_path);
      file.write(xml_post);
      file.close();
    } else {
      log("AcquiSuite XML", "error",  `${date_received}: ${serialNumber}_${address} || Error: ${errorNumber} || ErrorMsg: ${errorText}`);
      const file = createWriteStream(corr_path);
      file.write(xml_post);
      file.close();
    }
  } catch (e) {
    console.error(e);
  }
});

const port = 2175;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
