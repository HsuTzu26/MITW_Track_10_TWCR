const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-RegionalLymphNodesPositive",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-regional-lymph-nodes-positive-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-regional-lymph-nodes-positive-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Observation: {
        id: uuid["TWCR-RegionalLymphNodesPositive"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-regional-lymph-nodes-positive-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "final", //registered | preliminary | final | amended +
        value: "20", //20 | 未檢查區域淋巴結
        code: {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "21893-3",
                    display: "Regional lymph nodes positive [#] Specimen",
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

    return data;
};

module.exports.fields = [
    {
        source: "id",
        target: "Observation.id",
        beforeConvert: (data) => {
            return `TWCR-RegionalLymphNodesPositive-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //區域淋巴結侵犯數目
        source: "RLNP",
        target: "Observation.valueCodeableConcept",
        beforeConvert: (data) => {
            let valueCodeableConcept = JSON.parse(`
            {
            "coding" : [
                {
                "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/regional-lymph-node-positive-codesystem",
                "code" : "code",
                "display" : "display"
                }
            ]
            }
            `);
            valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-regional-lymph-node-positive-codesystem.json", data);
            valueCodeableConcept.coding[0].display = displayValue;

            return valueCodeableConcept;
        },
    },
    {
        source: "RLNPVQ",
        target: "Observation.valueQuantity",
        beforeConvert: (data) => {
            valueQuantity.value = parseInt(String(data));
            return valueQuantity;
        },
    },
];
