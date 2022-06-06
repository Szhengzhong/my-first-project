const Request = require("axios");
const URL = require("url");
const { createReadStream } = require("fs-extra");
const FormData = require("form-data");
const Path = require("path");

const Credentials = require("./credentials");
const Log = require("../logger");

module.exports = {
    get(command, parameters) {
        const uri = `https://api.encompass8.com/aspx1/API?EncompassID=DSDLink&APICommand=${command}&APIToken=${Credentials}&${(parameters || []).join("&")}`;
        console.log(uri);

        return new Promise((resolve, reject) => {
            Request.get(uri).then((response) => {
                const exportNode = (response.data || {}).Export;

                let node = "Table";

                if ((exportNode || {}).Report) node = "Report";

                if (exportNode && exportNode[node]) {
                    if (exportNode[node].Row && !Array.isArray(exportNode[node].Row)) resolve([exportNode[node].Row]);

                    resolve(exportNode[node].Row);
                }

                resolve([]);
            }).catch((error) => reject(error));
        })
    },

    post(command, parameters, content, filename) {
        const uri = `https://api.encompass8.com/aspx1/API?EncompassID=DSDLink&APICommand=${command}&APIToken=${Credentials}&${(parameters || []).join("&")}`;

        return new Promise((resolve, reject) => {
            const body = new URL.URLSearchParams();

            body.append("FileName", filename);
            body.append("File", content);

            Request.post(uri, body)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error));
        });
    },

    postZip(command, path, filename) {
        const uri = `https://api.encompass8.com/aspx1/API?EncompassID=DSDLink&APICommand=${command}&APIToken=${Credentials}&`;

        return new Promise((resolve, reject) => {
            const form = new FormData();
            form.append("file", createReadStream(Path.join(path, filename)));
            form.append("filename", filename);

            const request_config = {
                headers: {
                    ...form.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            };

            Request.post(uri, form, request_config)
                .then((response) => resolve(response.data))
                .catch((error) => {
                    Log.error(error);
                    reject(error);
                });
        });
    }
    
    
}