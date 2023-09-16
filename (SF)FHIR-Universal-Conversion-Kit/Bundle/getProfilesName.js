const fs = require("fs");
const path = require("path");

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

        // Define the value of priority sort
        const priorityValues = ["TWCR-Organization", "TWCR-Patient", "TWCR-Practitioner", "TWCR-Encounter"];

        // Sorting by self-definition sort function
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

// console.log(profiles, `\nResource num: ${profiles.length}`);

module.exports = {
    getProfilesName,
};
