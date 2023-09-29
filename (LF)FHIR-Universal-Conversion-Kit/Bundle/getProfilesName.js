const fs = require("fs"); // require file system module
const path = require("path"); // require path module

// Get the profile name in "profile" directory
function getProfilesName() {
    // Define the directory that need to searched
    const scriptDirectory = __dirname;
    const targetDirectory = path.join(scriptDirectory, "../profile");
    const files = [];

    // Get the files and subdirectory in targetDirectory
    const items = fs.readdirSync(targetDirectory);

    // Recursively search and get the profile names
    items.forEach((item) => {
        // Get the path of each directory
        const itemPath = path.join(targetDirectory, item);

        // Check whether items is directory
        if (fs.statSync(itemPath).isDirectory()) {
            // If it is a directory, search recursively
            files.push(...getProfilesName(itemPath));
        } else {
            // If it is file, check whether is the .js file and contains "TWCR", then get the file name and remove the extension
            if (item.endsWith(".js") && fs.readFileSync(itemPath, "utf8").includes("TWCR")) {
                const fileName = path.basename(itemPath, ".js");
                files.push(fileName);
            }
        }

        // 定义优先排序的值
        const priorityValues = ["TWCR-Organization", "TWCR-Patient", "TWCR-Practitioner", "TWCR-Encounter",  "TWCR-Condition" , 'TWCR-ClinicalT',   'TWCR-ClinicalN',   'TWCR-ClinicalM', 'TWCR-PathologicT', 'TWCR-PathologicN', 'TWCR-PathologicM',];

        // 使用自定义排序函数进行排序
        files.sort((a, b) => {
            const indexOfA = priorityValues.indexOf(a);
            const indexOfB = priorityValues.indexOf(b);

            if (indexOfA !== -1 && indexOfB !== -1) {
                return indexOfA - indexOfB;
            } else if (indexOfA !== -1) {
                return -1;
            } else if (indexOfB !== -1) {
                return 1;
            } else {
                return 0;
            }
        });
    });
    return files;
}

const profiles = getProfilesName();

const Form = {};

const { v4: uuidv4 } = require("uuid");
profiles.map((p) => (Form[p] = `${uuidv4()}`))

// // Store Bundle.json
// const UUIDFrom = __dirname + "/UUIDForm.json";
// const UUIDFromJson = JSON.stringify(Form, null, 4);
// fs.writeFileSync(UUIDFrom, UUIDFromJson, "utf-8", (e) => {
//     if (e) {
//         console.log(e);
//         return;
//     }
// });
module.exports = {
    getProfilesName,
};
