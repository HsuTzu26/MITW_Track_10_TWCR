const fs = require('fs');
// https://stackoverflow.com/questions/10011011/using-node-js-how-do-i-read-a-json-file-into-server-memory
var obj = JSON.parse(fs.readFileSync('../TWCR_ValueSets/TWCR_info.json', 'utf-8'));
// 檔案路徑要以FUCK核心所在的位置為基準

function fetchLatestTWCR() {
  var todayDate = new Date().toISOString().slice(0, 10);
  // https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd

  if (todayDate > obj.lastCheckDate) {
    console.log("今天尚未檢查TWCR FHIR IG網站是否更新，開始執行檢查...");
    var https = require("https");
    // https://stackoverflow.com/questions/6819143/curl-equivalent-in-node-js
    var options = obj.officalSite;

    var req = https.request(options, function (res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');

      // 檢查網頁Header的文件最後更新日期
      var text1 = res.headers["last-modified"].toString();
      var text2 = obj.officalSiteLastModified.toString();
      if (0 != text1.localeCompare(text2)) {
        // https://www.w3schools.com/jsref/jsref_localecompare.asp
        // The localeCompare() method returns sort order -1, 1, or 0 (for before, after, or equal).

        console.log("TWCR FHIR IG last-modified date: " + res.headers["last-modified"] +
          " 新於本地檢查紀錄檔的日期:" + obj.officalSiteLastModified
        );

        obj.officalSiteLastModified = res.headers["last-modified"];
        // 回存網頁最後更新日期
        fs.writeFileSync('../TWCR_ValueSets/TWCR_info.json', JSON.stringify(obj));
        // 將檢查紀錄寫回json文件

        // -----------------------------------
        // TWCR FHIR IG網站有更新，自動下載最新版Value Set package
        console.log("Downloading TWCR definitions.json.zip ...");
        // https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
        const packageFile = fs.createWriteStream("../TWCR_ValueSets/definitions.json.zip");
        const request = https.get(obj.definitionsDownloadLink, function (response) {
          response.pipe(packageFile);

          // after download completed close filestream
          packageFile.on("finish", () => {
            packageFile.close();
            console.log("Download Completed");

            // -----------------------------------
            // Unzip Downloaded file Start
            // https://stackoverflow.com/questions/10308110/simplest-way-to-download-and-unzip-files-in-node-js-cross-platform
            'use strict';
            var path = require('path');
            var StreamZip = require('../src/node_modules/node-stream-zip/node_stream_zip');

            var zip = new StreamZip({
              file: "../TWCR_ValueSets/definitions.json.zip"
              , storeEntries: true
            });

            zip.on('error', function (err) { console.error('[ERROR]', err); });

            zip.on('entry', function (entry) {
              var pathname = path.resolve('../TWCR_ValueSets/definitionsJSON', entry.name);
              if (/\.\./.test(path.relative('../TWCR_ValueSets/definitionsJSON', pathname))) {
                console.warn("[zip warn]: ignoring maliciously crafted paths in zip file:", entry.name);
                return;
              }
              if ('/' === entry.name[entry.name.length - 1]) {
                console.log('[DIR]', entry.name);
                return;
              }
              console.log('[FILE]', entry.name);
              zip.stream(entry.name, function (err, stream) {
                if (err) { console.error('Error:', err.toString()); return; }

                stream.on('error', function (err) { console.log('[ERROR]', err); return; });
                // example: save contents to file
                fs.mkdir(
                  path.dirname(pathname),
                  { recursive: true },
                  function (err) {
                    stream.pipe(fs.createWriteStream(pathname));
                  }
                );
              });
            });
            // Unzip Downloaded file End
            // -----------------------------------
            setTimeout(() => {
              console.log("定義檔更新成功，請重啟F.U.C.K並\n將剛才上傳的資料重新POST一次\n以套用最新版的定義資訊!");
            }, 1500);
          });
        });
        // -----------------------------------
      }
      else {
        console.log("順利檢查TWCR FHIR IG package下載頁面，目前本地定義檔為最新版無須更新!");
      }
    });
    req.on('error', function (e) {
      console.log('problem with request: ' + e.message);
    });
    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();

    // -----------------------------------
    obj.lastCheckDate = todayDate;
    // 回存最後的檢查日期
    fs.writeFileSync('../TWCR_ValueSets/TWCR_info.json', JSON.stringify(obj));
    // 將檢查紀錄寫回json文件
  }
}

module.exports = fetchLatestTWCR;