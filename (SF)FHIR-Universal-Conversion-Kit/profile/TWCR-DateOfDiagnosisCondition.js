const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json")
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
  name: 'TWCR-DateOfDiagnosisCondition',
  version: '1.0.0',
  fhirServerBaseUrl: 'https://hapi.fhir.tw/fhir',
  action: "upload", // return, upload
}
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-date-of-diagnosis-condition-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Condition-DateOfDiagnosisConditionExample.json.html

module.exports.globalResource = {
  // Should be resource name
  Condition: {
    id: uuid["TWCR-DateOfDiagnosisCondition"],
    meta: {
      profile: [
        "https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-date-of-diagnosis-condition-profile"
      ]
    },
    text: {
      status: "empty",
      div: "<div xmlns=\"http://www.w3.org/1999/xhtml\">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>"
    },
    subject: {
      reference: `Patient/${uuid["TWCR-Patient"]}`
    }
  }
}

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
  checkTWCR();
  // 在開始轉換前檢查TWCR的package是否有更新

  return data;
}

module.exports.fields = [
  {
    source: 'id',
    target: 'Condition.id',
    beforeConvert: (data) => {
      return `TWCR-DateOfDiagnosisCondition-${data}-${tools.getCurrentTimestamp()}`;
    }
  },
  {
    // 最初診斷日期	DOID	onsetPeriod.start
    source: 'DOID',
    target: 'Condition.onsetPeriod',
    // target: 'Condition.id',
    // 單一欄位可以放到相同FHIR Resoucre的不同Object
    // 但仍找不到方法解決BetelNutChewingBehavior的放到同個Object多次
    beforeConvert: (data) => {
      let onsetPeriod = JSON.parse(`
      {
        "start" : "2019-02-22"
      }
      `);

      let s = String(data);
      let YYYY = s[0] + s[1] + s[2] + s[3];
      let MM = s[4] + s[5];
      let DD = s[6] + s[7];
      onsetPeriod.start = `${YYYY}-${MM}-${DD}`;

      return onsetPeriod;
    }
  }
]