const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");

module.exports.profile = {
    name: "TWCR-HormoneSteroidTherapy",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-hormone-steroid-therapy-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-hormone-steroid-therapy-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-HormoneSteroidTherapy"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-hormone-steroid-therapy-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        status: "completed", //preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
        category: {
            coding: [
                {
                    system: "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
                    code: "HormoneSteroid",
                    display: "申報醫院荷爾蒙/類固醇治療",
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
        target: "Procedure.id",
        beforeConvert: (data) => {
            return `TWCR-HormoneSteroidTherapy-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //申報醫院荷爾蒙/類固醇治療
        source: "HOMSTTF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let DHSTSTCode = JSON.parse(`
            {
                "valueCodeableConcept" : {
                    "coding" : [
                        {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/hormone-steroid-therapy-codesystem",
                        "code" : "HormoneSteroidTherapy",
                        "display" : "申報醫院荷爾蒙/類固醇治療"
                        }
                    ]
                }
            }
           `);
            DHSTSTCode.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-hormone-steroid-therapy-codesystem.json", data);
            DHSTSTCode.valueCodeableConcept.coding[0].display = displayValue;

            return DHSTSTCode;
        },
    },
    {
        //申報醫院荷爾蒙/類固醇治療開始日期
        source: "DHSTSTF",
        target: "Procedure.performedDateTime",
        beforeConvert: (data) => {
            let perDateTime = JSON.parse(`
            {
                "start" : "2019-02-22"
            }
            `);

            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            perDateTime.start = `${YYYY}-${MM}-${DD}`;

            return perDateTime;
        },
    },
];
