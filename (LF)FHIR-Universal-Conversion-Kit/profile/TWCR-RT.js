const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-RT",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-rt-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-rt-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-RT"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-rt-profile"],
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
                    code: "RT",
                    display: "申報醫院放射治療",
                },
            ],
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`
        },
        performed: "2020-03-06 --> 2021-01-08",
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
            return `TWCR-RT-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //申報醫院放射治療
        source: "RT",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let RT = JSON.parse(`
            {
                "code" : {
                "coding" : [
                    {
                    "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/rt-modality-codesystem",
                    "code" : "HormoneSteroid",
                    "display" : "申報醫院放射治療"
                    }
                ]
            },
            `);
            RT.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-institute-of-RT-codesystem.json", data);
            RT.valueCodeableConcept.coding[0].display = displayValue;

            return RT;
        },
    },
    {
        //放射治療開始日期/結束日期
        source: "RtStart",
        target: "Procedure.performedPeriod",
        beforeConvert: (data) => {
            let perDateTimeStart = JSON.parse(`
            {
                "start" : "2019-02-22"
            }
            `);

            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            perDateTimeStart.start = `${YYYY}-${MM}-${DD}`;

            return perDateTimeStart;
        },
    },
    {
        //放射治療開始日期/結束日期
        source: "RtEnd",
        target: "Procedure.performedPeriod",
        beforeConvert: (data) => {
            let perDateTimeEnd = JSON.parse(`
            {
                "end"："2021-02-22"
            }
            `);

            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            perDateTimeEnd.end = `${YYYY}-${MM}-${DD}`;

            return perDateTimeEnd;
        },
    },
    {
        //放射治療臨床標靶體積摘要
        source: "RTTSUM",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let RTTSUM = JSON.parse(`
            {                
                "valueCodeableConcept" : {
                    "coding" : [
                    {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
                        "code" : "codeValue",
                        "display" : "displayValue"
                    }
                    ]
                },
                "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/rt-target-summary-extension"         
            }
            `);
            RTTSUM.valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-rt-target-summary-codesystem.json", data);
            RTTSUM.valueCodeableConcept.coding[0].display = displayValue;
            return RTTSUM;
        },
    },
    {
        //放射治療執行狀態
        source: "RFNRT",
        target: "Procedure.extension",
        beforeConvert: (data) => {
            let RFNRT = JSON.parse(`
            
                [
                    {                
                "valueCodeableConcept" : {
                    "coding" : [
                    {
                        "system" : "https://mitw.dicom.org.tw/IG/TWCR/CodeSystem/procedure-code-codesystem",
                        "code" : "codeValue",
                        "display" : "displayValue"
                    }
                    ]
                },
                "url" : "https://hapi.fhir.tw/fhir/StructureDefinition/rt-status-extension"         
            }
        ]
        
            `);
            RFNRT[0].valueCodeableConcept.coding[0].code = data;
            let displayValue = tools.searchCodeSystemDisplayValue("../TWCR_ValueSets/definitionsJSON/CodeSystem-rt-status-codesystem.json", data);
            RFNRT[0].valueCodeableConcept.coding[0].display = displayValue;
            return RFNRT;
        },
    },
];
