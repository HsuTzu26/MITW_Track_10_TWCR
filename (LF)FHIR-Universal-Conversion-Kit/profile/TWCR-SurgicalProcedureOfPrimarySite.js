const checkTWCR = require("../TWCR_ValueSets/fetchLatestTWCR.js");
const tools = require("../TWCR_ValueSets/tools.js");
// 檔案路徑要以FUCK核心所在的位置為基準
const uuid = require("../Bundle/UUIDForm.json");
module.exports.profile = {
    name: "TWCR-SurgicalProcedureOfPrimarySite",
    version: "1.0.0",
    fhirServerBaseUrl: "https://hapi.fhir.tw/fhir",
    action: "upload", // return, upload
};
// 此Profile的JSON結構資料參考自以下網頁:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-procedure-of-primary-site-profile.html
// 此Profile的完整JSON範例檔:
// https://mitw.dicom.org.tw/IG/TWCR_LF/StructureDefinition-surgical-procedure-of-primary-site-profile.profile.json.html

module.exports.globalResource = {
    // Should be resource name
    Procedure: {
        id: uuid["TWCR-SurgicalProcedureOfPrimarySite"],
        meta: {
            profile: ["https://hapi.fhir.tw/fhir/StructureDefinition/twcr-lf-surgical-procedure-of-primary-site-profile"],
        },
        text: {
            status: "empty",
            div: '<div xmlns="http://www.w3.org/1999/xhtml">目前為空值，可根據使用需求自行產生這筆資料的摘要資訊並填入此欄位</div>',
        },
        subject: {
            reference: `Patient/${uuid["TWCR-Patient"]}`
        },
        performed: "2020-03-06 --> (ongoing)",
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
            return `TWCR-SurgicalProcedureOfPrimarySite-${data}-${tools.getCurrentTimestamp()}`;
        },
    },
    {
        //申報醫院原發部位手術方式
        source: "SPPSTF",
        target: "Procedure.code",
        beforeConvert: (data) => {
            let SPPSTFCode = JSON.parse(`
            {
                "text" : "text"
            }
            `);
            SPPSTFCode.text = data;

            return SPPSTFCode;
        },
    },
    {
        //原發部位最確切的手術切除日期
        source: "DOMSUPS",
        target: "Procedure.performedDateTime",
        beforeConvert: (data) => {
            let s = String(data);
            let YYYY = s[0] + s[1] + s[2] + s[3];
            let MM = s[4] + s[5];
            let DD = s[6] + s[7];
            let perDateTime = `${YYYY}-${MM}-${DD}`;

            return perDateTime;
        },
    },
];
