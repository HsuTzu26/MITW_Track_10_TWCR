"use strict";

const resources = Object.assign({}, require("./resources"));
const schema = require("./fhir_schema/schema.json");
const objectPath = require("object-path");
const jp = require("jsonpath");
const axios = require("axios");
// const uuid = require("uuid")
const uuid = require("../../../Bundle/UUIDForm.json");

// load all profiles from profile folder
const _profiles = {};
const profilePath = "../../../profile";
const fs = require("fs");
const path = require("path");
const profileFiles = fs.readdirSync(path.join(__dirname, profilePath));
profileFiles.forEach((file) => {
    const profile = require(path.join(__dirname, profilePath, file));
    _profiles[profile.profile.name] = profile;
});
class Convert {
    constructor(src, useProfile) {
        this.data = src;
        this.useProfile = useProfile;
        this.resourceIdList = {};
        this.profiles = JSON.parse(JSON.stringify(_profiles));
        if (!_profiles[this.useProfile]) {
            throw new Error("Profile not found.");
        } else {
            // console.log(useProfile);
            this.bundle = JSON.parse(JSON.stringify(resources.Bundle(useProfile)));
        }
        // console.log(this.useProfile)
    }

    async convert() {
        // iterate through each field in the data
        let data = JSON.parse(JSON.stringify(this.data));
        let bundle = JSON.parse(JSON.stringify(this.bundle));
        let resourceIdList = JSON.parse(JSON.stringify(this.resourceIdList));
        let profiles = JSON.parse(JSON.stringify(this.profiles));
        // console.log(this.useProfile)
        // find the profile
        let profile = JSON.parse(JSON.stringify(profiles[this.useProfile]));
        if (!profile) {
            throw new Error("Profile not found.");
        }
        
        // run beforeProcess
        data = _profiles[this.useProfile].beforeProcess ? _profiles[this.useProfile].beforeProcess(data) : data;

        for (const field in data) {
            // find target field in the config
            let targetField = profile.fields.find((f) => {
                return f.source === field;
            });
            if (!targetField) {
                continue;
            }
            const target = targetField.target;

            // get the resource type
            let resourceType = target.split(".")[0];
            // bundle.entry.entry = {};
            // find resource in the bundle
            let resource = bundle.entry.find((entry) => entry.resource.resourceType === resourceType);
            // if resource does not exist, create it
            // console.log(JSON.stringify(resource))
            if (!resource) {
                bundle.entry.push({
                    fullUrl: `${profile.profile.fhirServerBaseUrl}${resourceType}/${uuid[this.useProfile]}`,
                    resource: {
                        resourceType: resourceType,
                        id: `${uuid[this.useProfile]}`,
                        ...profile.globalResource[resourceType],
                    },
                    request: {
                        method: "PUT",
                        url: `${resourceType}/${uuid[this.useProfile]}`,
                    },
                });
            }

            // get resource index in the bundle
            let resourceIndex = bundle.entry.findIndex((entry) => entry.resource.resourceType === resourceType);

            // get fhir path in the target
            let fhirPath = target.split(".").slice(1).join(".");

            // run beforeConvert function if it exists
            const targetbeforeConvert = _profiles[this.useProfile].fields.find((f) => {
                return f.source === field;
            });
            let preprocessedData = targetbeforeConvert.beforeConvert ? targetbeforeConvert.beforeConvert(data[field]) : data[field];

            // skip if the data is empty
            if (preprocessedData === null) {
                continue;
            }

            // console.log(JSON.stringify(preprocessedData,null,4))

            // console.log("schema",schema.definitions[resourceType].properties[fhirPath].type)

            // write the resource to the bundle
            switch (schema.definitions[resourceType].properties[fhirPath].type) {
                case "array":
                    objectPath.push(bundle.entry[resourceIndex].resource, fhirPath, preprocessedData);
                    break;
                default:
                    objectPath.set(bundle.entry[resourceIndex].resource, fhirPath, preprocessedData);
                    break;
            }
            // console.log(JSON.stringify(bundle.entry[0]))

            // if id was changed, update the fullUrl
            bundle.entry[resourceIndex].fullUrl = `${profile.profile.fhirServerBaseUrl}${resourceType}/${bundle.entry[resourceIndex].resource.id}`;
            bundle.entry[resourceIndex].request.url = `${resourceType}/${bundle.entry[resourceIndex].resource.id}`;
            resourceIdList[resourceType] = bundle.entry[resourceIndex].resource.id;
        }
        // build id list
        resourceIdList = {};
        for (let i = 0; i < bundle.entry.length; i++) {
            resourceIdList[bundle.entry[i].resource.resourceType] = bundle.entry[i].resource.id;
        }

        const references = jp.nodes(bundle.entry, "$..reference");
        for (let i = 0; i < references.length; i++) {
            const reference = references[i];

            if (reference.value.startsWith("#")) {
                const resourceType = reference.value.substring(1);
                const resourceIndex = reference.path[1];
                const resourceId = resourceIdList[resourceType];

                objectPath.set(bundle.entry[resourceIndex], reference.path.slice(2).join("."), `${resourceType}/${resourceId}`);
            }
        }

        // console.log("Profile:" + JSON.stringify(profile));
        // console.log("Token:" + profile.profile.token);
        let headerConfigs = {
            headers: {
                Authorization: `Bearer ${profile.profile.token}`,
                // https://stackoverflow.com/questions/40988238/sending-the-bearer-token-with-axios
            },
        };
        // return convert result or upload to FHIR server
        if (profile.profile.action === "return") {
            return bundle;
        }
        // console.log(bundle.entry[0])
        if (profile.profile.action === "upload") {
            const result = await axios
                .put(`${profile.profile.fhirServerBaseUrl}/${bundle.entry[0].resource.resourceType}/${uuid[this.useProfile]}`, bundle.entry[0].resource, headerConfigs)
                .catch((err) => {
                    // console.log(err.response.data);
                    console.log(JSON.stringify(bundle.entry[0], null, 4));
                    throw new Error(JSON.stringify(err.response.data, null, 4));
                });
            return result.data;
        }
    }
}

module.exports.Convert = Convert;
