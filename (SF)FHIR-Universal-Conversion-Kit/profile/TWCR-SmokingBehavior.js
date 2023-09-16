const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json")
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
  name: 'TWCR-SmokingBehavior',
  version: '1.0.0',
  fhirServerBaseUrl: 'https://hapi.fhir.tw/fhir',
  action: "upload", // return, upload
}
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-smoking-behavior-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Observation-SmokingBehaviorExample.json.html

module.exports.globalResource = {
  // Should be resource name
  Observation: {
    id: uuid["TWCR-SmokingBehavior"],
    meta: {
      profile: [
        " https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-smoking-behavior-profile"
      ]
    },
    text: {
      status: "empty",
      div: "<div xmlns=\"http://www.w3.org/1999/xhtml\">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>"
    },
    status: "registered", //registered | preliminary | final | amended +
    code: {
      coding: [
        {
          system: "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/behavior-codesystem",
          code: "Smoking",
          display: "吸菸行為"
        }
      ]
    }
  }
}

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
  checkTWCR();
  // 在開始轉換前檢查TWCR的package是否有更新

  // 必須將SMOKBE拆為三欄資料，否則無法順利轉換
  // (因為F.U.C.K自動幫DataType為Array的目標FHIR Resource加上[])
  data.SMOKBE_amount = String(data.SMOKBE).slice(0, 2);
  data.SMOKBE_year = String(data.SMOKBE).slice(2, 4);
  data.SMOKBE_quit = String(data.SMOKBE).slice(4, 6);

  // beforeProcess超級強大的! 感覺真的什麼資料都可以處理!!!
  // console.log(data);

  return data;
}

module.exports.fields = [
  {
    source: 'id',
    target: 'Observation.id',
    beforeConvert: (data) => {
      return `TWCR-SmokingBehavior-${data}-${tools.getCurrentTimestamp()}`;
    }
  },
  // Start of 吸菸行為	SMOKBE	valueCodeableConcept
  {
    source: 'SMOKBE_amount',
    target: 'Observation.component',
    beforeConvert: (data) => {
      let component = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-behavior-codesystem",
              "code" : "amount",
              "display" : "每日吸菸量，以”支”計算"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-amount-codesystem",
              "code" : "code",
              "display" : "display"
            }
          ]
        }
      }
      `);
      component.valueCodeableConcept.coding[0].code = String(data);
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-smoking-amount-codesystem.json", String(data));
      component.valueCodeableConcept.coding[0].display = displayValue;

      return component;
    }
  },
  {
    source: 'SMOKBE_year',
    target: 'Observation.component',
    beforeConvert: (data) => {
      let component = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-behavior-codesystem",
              "code" : "year",
              "display" : "吸菸年"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-year-codesystem",
              "code" : "code",
              "display" : "display"
            }
          ]
        }
      }
      `);
      component.valueCodeableConcept.coding[0].code = String(data);
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-smoking-year-codesystem.json", String(data));
      component.valueCodeableConcept.coding[0].display = displayValue;

      return component;
    }
  },
  {
    source: 'SMOKBE_quit',
    target: 'Observation.component',
    beforeConvert: (data) => {
      let component = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-behavior-codesystem",
              "code" : "quit",
              "display" : "戒菸年"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/smoking-quit-codesystem",
              "code" : "code",
              "display" : "display"
            }
          ]
        }
      }
      `);
      component.valueCodeableConcept.coding[0].code = String(data);
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-smoking-quit-codesystem.json", String(data));
      component.valueCodeableConcept.coding[0].display = displayValue;

      return component;
    }
  }
  // End of 吸菸行為	SMOKBE	valueCodeableConcept
]