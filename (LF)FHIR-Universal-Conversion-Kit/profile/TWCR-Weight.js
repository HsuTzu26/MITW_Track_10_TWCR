const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-Weight",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-weight-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-weight-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-Weight"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-weight-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", //registered | preliminary | final | amended +
        value: "68",
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "29463-7",
                    display: "Body Weight",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`
        },
    },
};

// Global Preprocessor Hook
// Data will run the following function before we iterate each fields
module.exports.beforeProcess = (data) => {
    checkTWCR();
    // 在開始轉換前檢查TWCR的package是否有更新

    // *依據申報內容不同有可能為 valueCodeableConcept 或 valueQuantity
    // 經過beforeProcess的處理後再決定target

    // beforeProcess超級強大的! 感覺真的什麼資料都可以處理!!!
    // console.log(data);

    if (parseInt(String(data.WEIGHT)) >= 600) {
        // 體重超過600公斤不太可能發生，應該推論為code999或是其他code值
        data.WEIGHT_valueCodeableConcept = String(data.WEIGHT);
    } else {
        // 記載的數據確實為體重，以valueQuantity儲存
        data.WEIGHT_valueQuantity = String(data.WEIGHT);
    }

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-Weight-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        // 體重	WEIGHT	valueCodeableConcept / valueQuantity
        // *依據申報內容不同有可能為 valueCodeableConcept 或 valueQuantity
        source: "WEIGHT_valueCodeableConcept",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
              "coding" : [
                {
                  "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/weight-codesystem",
                  "code" : "code",
                  "display" : "display"
                }
              ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-weight-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
    {
        // 體重	WEIGHT	valueCodeableConcept / valueQuantity
        // *依據申報內容不同有可能為 valueCodeableConcept 或 valueQuantity
        source: "WEIGHT_valueQuantity",
        target: "Observation.valueQuantity",
        beforeConvert: (data) => {
            let valueQuantity = JSON.parse(`
      {
        "value" : 168,
        "unit" : "kg",
        "system" : "http://unitsofmeasure.org",
        "code" : "kg"
      }
      `);

            valueQuantity.value = parseInt(String(data));

            return valueQuantity;
        },
    },
];
