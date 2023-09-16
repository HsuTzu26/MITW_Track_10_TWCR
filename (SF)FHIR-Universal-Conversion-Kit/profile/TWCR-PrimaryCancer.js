const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json")
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
  name: 'TWCR-PrimaryCancer',
  version: '1.0.0',
  fhirServerBaseUrl: 'https://hapi.fhir.tw/fhir',
  action: "upload", // return, upload
}
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-primary-cancer-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Condition-PrimaryCancerExample.json.html

module.exports.globalResource = {
  // Should be resource name
  Condition: {
    id: uuid["TWCR-PrimaryCancer"],
    meta: {
      profile: [
        " https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-primary-cancer-profile"
      ]
    },
    text: {
      status: "empty",
      div: "<div xmlns=\"http://www.w3.org/1999/xhtml\">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>"
    },
    subject : {
      reference : `Patient/${uuid["TWCR-Patient"]}`
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
      return `TWCR-PrimaryCancer-${data}-${tools.getCurrentTimestamp()}`;
    }
  },
  {
    // Extension: Histology
    // https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-primary-cancer-profile.html
    source: 'HISTGY', //Histology.extension.valueCodeableConcept.coding.code
    target: 'Condition.extension',
    beforeConvert: (data) => {
      let Histology = JSON.parse(`
      {
        "extension" : [
          {
            "url" : "histology",
            "valueCodeableConcept" : {
              "coding" : [
                {
                  "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/histology-codesystem",
                  "code" : "codeValue",
                  "display" : "displayValue"
                }
              ]
            }
          }
        ],
        "url" : " https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-histology-extension"
      }
      `);
      Histology.extension[0].valueCodeableConcept.coding[0].code = data;
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-histology-codesystem.json", data);
      Histology.extension[0].valueCodeableConcept.coding[0].display = displayValue;

      // https://mitw.dicom.org.tw/IG/TWCR_SF/Condition-PrimaryCancerExample.json.html
      return Histology;
    }
  },
  {
    // Extension: BehaviorCode
    // https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-primary-cancer-profile.html
    source: 'BEHCODE', //BehaviorCode.extension.valueCodeableConcept.coding.code
    target: 'Condition.extension',
    beforeConvert: (data) => {
      let BehaviorCode = JSON.parse(`
      {
        "extension" : [
          {
            "url" : "behaviorCode",
            "valueCodeableConcept" : {
              "coding" : [
                {
                  "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/behavior-code-codesystem",
                  "code" : "codeValue",
                  "display" : "displayValue"
                }
              ]
            }
          }
        ],
        "url" : " https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-behavior-code-extension"
      }
      `);
      BehaviorCode.extension[0].valueCodeableConcept.coding[0].code = data;
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-behavior-code-codesystem.json", data);
      BehaviorCode.extension[0].valueCodeableConcept.coding[0].display = displayValue;
      
      // https://mitw.dicom.org.tw/IG/TWCR_SF/Condition-PrimaryCancerExample.json.html
      return BehaviorCode;
    }
  },
  {
    // bodySite: primary-site
    source: 'PRIST', //primary-site.coding.code
    target: 'Condition.bodySite',
    beforeConvert: (data) => {
      let primarySite = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/primary-site-codesystem",
            "code" : "codeValue",
            "display" : "External lip upper"
          }
        ]
      }
      `);
      primarySite.coding[0].code = data;
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-primary-site-codesystem.json", data);
      primarySite.coding[0].display = displayValue;

      return primarySite;
    }
  },
  {
    // bodySite: laterality
    source: 'LATLITY', //laterality.coding.code
    target: 'Condition.bodySite',
    beforeConvert: (data) => {
      let laterality = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/laterality-codesystem",
            "code" : "codeValue",
            "display" : "displayValue"
          }
        ]
      }
      `);
      laterality.coding[0].code = data;
      let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-laterality-codesystem.json", data);
      laterality.coding[0].display = displayValue;

      return laterality;
    }
  }
]