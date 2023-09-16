const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-TumorSize",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-tumor-size-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-tumor-size-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-TumorSize"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-tumor-size-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", //registered | preliminary | final | amended +
        value: "20 millimeter", //20 millimeter | 描述為＜1 cm
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "33728-7",
                    display: "Size.maximum dimension in Tumor",
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
    // CRDB中 TMSIZE 最大為1xx, 998/999的病理分級都是X
    data.TMSIZE_copy = String(data.TMSIZE)

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-TumorSize-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        source: "TMSIZE_copy",
        target: "Observation.valueQuantity",
        beforeConvert: (data) => {
            let valueQuantity = JSON.parse(`
            {
                "value" : "999",
                "unit" : "millimeter",
                "system" : "http://unitsofmeasure.org",
                "code" : "mm"
            }
      `);

            

            if (parseInt(String(data)) <= 300) {
                valueQuantity.value = parseInt(String(data));
                return valueQuantity;
            } else return null;
        },
    },
    {
        source: "TMSIZE",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
                "coding" : [
                    {
                    "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-tumor-size-codesystem",
                    "code" : "code",
                    "display" : "display"
                    }
                ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-tumor-size-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
];
