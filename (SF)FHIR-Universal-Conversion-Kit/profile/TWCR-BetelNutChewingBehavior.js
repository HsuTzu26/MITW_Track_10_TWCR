const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
const uuid = require("../Bundle/UUIDForm.json");
// 檔案路徑要以FUCK核心所在的位置為基準

module.exports.profile = {
    name: "TWCR-BetelNutChewingBehavior",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_SF/StructureDefinition-betel-nut-chewing-behavior-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_SF/Observation-BetelNutChewingBehaviorExample.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-BetelNutChewingBehavior"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-sf-betel-nut-chewing-behavior-profile"],
        },
        status: "registered",
        code: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-observation-behavior-codesystem",
                    code: "BetelNutChewing",
                    display: "嚼檳榔行為",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
    },
};

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
    checkTWCR();
    // 在開始轉換前檢查TWCR的package是否有更新

    // 必須將BETELBE拆為三欄資料，否則無法順利轉換
    // (因為F.U.C.K自動幫DataType為Array的目標FHIR Resource加上[])
    data.BETELBE_amount = String(data.BETELBE).slice(0, 2);
    data.BETELBE_year = String(data.BETELBE).slice(2, 4);
    data.BETELBE_quit = String(data.BETELBE).slice(4, 6);

    // beforeProcess超級強大的! 感覺真的什麼資料都可以處理!!!
    // console.log(data);

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-BetelNutChewingBehavior-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 嚼檳榔行為	BETELBE	valueCodeableConcept
        // 詢問Lily 此profile binding的值集是否要另外設計(目前是用吸菸的CodeSystem)
        source: "BETELBE_amount",
        target: "Observation.component",
        beforeConvert: (data) => {
            let componentAmount = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-behavior-codesystem",
              "code" : "amount",
              "display" : "每日嚼檳榔量，以 ”顆” 計算"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-amount-codesystem",
              "code" : "",
              "display" : ""
            }
          ]
        }
      }
      `);
            componentAmount.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-betel-nut-chewing-amount-codesystem.json", data);
            componentAmount.valueCodeableConcept.coding[0].display = displayValue;

            return componentAmount;
        },
    },
    {
        source: "BETELBE_year",
        target: "Observation.component",
        beforeConvert: (data) => {
            let componentYear = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-behavior-codesystem",
              "code" : "year",
              "display" : "嚼檳榔年"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-year-codesystem",
              "code" : "",
              "display" : ""
            }
          ]
        }
      }
      `);
            componentYear.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-betel-nut-chewing-year-codesystem.json", data);
            componentYear.valueCodeableConcept.coding[0].display = displayValue;

            return componentYear;
        },
    },
    {
        source: "BETELBE_quit",
        target: "Observation.component",
        beforeConvert: (data) => {
            let componentQuit = JSON.parse(`
      {
        "code" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-behavior-codesystem",
              "code" : "quit",
              "display" : "戒嚼檳榔年"
            }
          ]
        },
        "valueCodeableConcept" : {
          "coding" : [
            {
              "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-sf-betel-nut-chewing-quit-codesystem",
              "code" : "",
              "display" : ""
            }
          ]
        }
      }
      `);
            componentQuit.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-betel-nut-chewing-quit-codesystem.json", data);
            componentQuit.valueCodeableConcept.coding[0].display = displayValue;

            return componentQuit;
        },
    },
];
