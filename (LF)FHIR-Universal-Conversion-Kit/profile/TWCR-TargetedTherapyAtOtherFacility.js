const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-TargetedTherapyAtOtherFacility",
    version: "1.0.0",
    fhirServerBaseUrl: "http://152.38.3.250:8080/fhir/",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-targeted-therapy-at-other-facility-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-targeted-therapy-at-other-facility-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-TargetedTherapyAtOtherFacility"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-targeted-therapy-at-other-facility-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-procedure-code-codesystem",
                    code: "OtherFacilityTargetedTherapy",
                    display: "外院標靶治療",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`,
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
        target: "Procedure.id",
        beforeConvert: (data) => {
            return `TWCR-TargetedTherapyAtOtherFacility-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //外院免疫治療
        source: "TTAOF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let TTAOFCode = JSON.parse(`
            {
                "coding" : [
                    {
                      "system" : "https://hapi.fhir.tw/fhir/CodeSystem/twcr-lf-other-targeted-therapy-codesystem",
                      "code" : "20",
                      "display" : "僅接受臨床試驗標靶治療"
                    }
                ]
            }
            `);
            TTAOFCode.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-twcr-lf-other-targeted-therapy-codesystem.json", data);
            TTAOFCode.coding[0].display = displayValue;

            return TTAOFCode;
        },
    },
];
