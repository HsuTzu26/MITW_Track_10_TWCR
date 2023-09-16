const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-Condition",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-condition-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-condition-profile.profile.json.html
module.exports.globalResource = {
    // Should be resource name
    Condition: {
        id: uuid["TWCR-Condition"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-condition-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
        },
        performer: {
            reference: `Practitioner/${uuid["TWCR-Practitioner"]}`,
        },
        encounter: {
            reference: `Encounter/${uuid["TWCR-Encounter"]}`,
        },
    },
};

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
    checkTWCR();
    // 在開始轉換前檢查TWCR的package是否有更新

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Condition.id",
        beforeConvert: (data) => {
            return `TWCR-Condition-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //個案分類
        source: "CASE",
        target: "Condition.category", // Binding: 個案分類值集
        beforeConvert: (data) => {
            // codeValue:0-3,5,7-9
            let category = JSON.parse(` 
        {
            "coding":[
                {
                  "system": "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/class-of-case-codesystem",
                  "code": "codeValue", 
                  "display": "displayValue"
                }
              ]
        }
        `);
            category.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-class-of-case-codesystem.json", data);
            category.coding[0].display = displayValue;

            return category;
        },
    },
    {
        //診斷狀態分類
        source: "CDS",
        target: "Condition.category", //Binding: 診斷狀態分類值集
        beforeConvert: (data) => {
            //codeValue: 1-3,5,7-8
            let category = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/class-of-diangosis-status-codesystem",
            "code" : "codeValue",
            "display" : "displayValue"
          }
        ]
      }
      `);

            category.coding[0].code = data;

            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-class-of-diangosis-status-codesystem.json", data);
            category.coding[0].display = displayValue;

            return category;
        },
    },
    {
        //治療狀態分類
        source: "CTS",
        target: "Condition.category", // Binding: 治療狀態分類值集
        beforeConvert: (data) => {
            //codeValue: 0-9
            let category = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/class-of-treatment-status-codesystem",
            "code" : "codeValue",
            "display" : "displayValue"
          }
        ]
      }
      `);

            category.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-class-of-treatment-status-codesystem.json", data);
            category.coding[0].display = displayValue;

            return category;
        },
    },
    {
        //癌症發生順序號碼
        source: "SEQNO",
        target: "Condition.code", //Binding: 癌症發生順序號碼值集
        beforeConvert: (data) => {
            //codeValue: 00-99
            let code = JSON.parse(`
      {
        "coding" : [
          {
            "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/sequence-number-codesystem",
            "code" : "codeValue",
            "display" : "displayValue"
          }
        ]
      }
      `);

            code.coding[0].code = data;
            code.coding[0].code = parseInt(code.coding[0].code);
            if (code.coding[0].code < 10) {
                let cacheNumber = code.coding[0].code;
                code.coding[0].code = "0" + String(cacheNumber);
                // 按照 https://mitw.dicom.org.tw/IG/TWCR_SF/ValueSet-sequence-number-valueset.html
                // 的定義值，把code value進行轉換
            }

            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-sequence-number-codesystem.json", String(code.coding[0].code));
            code.coding[0].display = displayValue;

            return code;
        },
    },
    {
        source: "DISAGE",
        target: "Condition.onsetAge",
        beforeConvert: (data) => {
            let onsetAge = JSON.parse(`
      {
        "value" : 60,
        "system" : "http://unitsofmeasure.org",
        "code" : "a"
      }
      `);
            onsetAge.value = parseInt(data); // 根據FHIR的定義，應該要是正整數
            return onsetAge;
        },
    },
    {
        //癌症確診方式
        source: "DGNCON",
        target: "Condition.evidence",
        beforeConvert: (data) => {
            //codeValue: 1-9
            let evidence = JSON.parse(`
      {
        "code" : [
          {
            "coding" : [
              {
                "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/diagnostic-confirmation-codesystem",
                "code" : "codeValue",
                "display" : "displayValue"
              }
            ]
          }
        ]
      }
      `);

            evidence.code[0].coding[0].code = data;

            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-diagnostic-confirmation-codesystem.json", data);
            evidence.code[0].coding[0].display = displayValue;

            // https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-condition-profile.html
            return evidence;
        },
    },
];
