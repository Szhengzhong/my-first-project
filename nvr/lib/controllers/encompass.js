const MACAddress = require("macaddress");
const SystemInfo = require("systeminformation");
const OS = require("os");

const Player = require("../models/player");
const ECP = require("./ecp");

class Encompass {
    constructor(app) {
        app.get("/api/player", (request, response) => this.player(request, response));
        app.get("/api/unregistered", (request, response) => this.unregistered(request, response));
        app.get("/api/cameras", (request, response) => this.cameras(request, response));
        app.put("/api/cameras", (request, response) => this.addCamera(request, response))
        app.post("/api/ip", (request, response) => this.logIp(request, response));
        app.post("/api/board", (request, response) => this.boardInfo(request, response));
        app.post("/api/register", (request, response) => this.register(request, response));
        app.post("/api/update", (request, response) => this.save(request, response));
        app.post("/api/cameras", (request, response) => this.updateCamera(request, response));
        app.delete("/api/cameras", (request, response) => this.deleteCameras(request, response));
    }

    async player(_request, response) {
        const mac = await this.mac();

        let registration = (await ECP.get("Get_Screen", [`parameters=F:MACAddress~V:${mac}~O:E`]))[0] || {};

        Player.code = this.uuid();
        Player.encompassId = registration.EncompassID_DBValue;
        Player.player = parseInt(registration.ZZ_SignagePlayersID, 10);
        Player.address = registration.IPAddress,
        Player.manufacturer = registration.Manufacturer_DBValue,
        Player.name = registration.Name;
        Player.url = registration.URL_DBValue;
        Player.registration = undefined;

        if (registration.EncompassID === "Unregistered") {
            Player.registration = registration.Name;
            Player.encompassId = "";
        }
        
        if (!Player.player) {
            let content = "";

            content += "\"EncompassID\",\"MACAddress\",\"Name\"\n";
            content += `"Unregistered","${mac}","${Player.code}"\n`;

            await ECP.post("Register_Screen", undefined, content, "player.csv");

            registration = (await ECP.get("Get_Screen", [`parameters=F:MACAddress~V:${mac}~O:E`]))[0] || {};

            Player.player = parseInt(registration.ZZ_SignagePlayersID, 10);
            Player.encompassId = registration.EncompassID_DBValue;
            Player.address = registration.IPAddress,
            Player.manufacturer = registration.Manufacturer_DBValue,
            Player.name = registration.Name;
            Player.url = registration.URL_DBValue;
            Player.registration = Player.code; 
        }

        return response.send({
            result: Player,
            time: new Date().toISOString()
        }); 
    }

    async logIp(_request, response) {
        const mac = await this.mac();
        let ip = "";

        const ifaces = OS.networkInterfaces();
        const results = [];

        Object.keys(ifaces).forEach((ifname) => {
            ifaces[ifname].forEach((iface) => {
                if (iface.family !== "IPv4" || iface.internal !== false) return;

                if (results.indexOf(iface.address) === -1) results.push(`${iface.address}`);
            });
        });

        if (results.length > 0) ip = results[0];

        if (ip && ip !== "" && ip !== Player.address) {
            let content = "";

            content += "\"MACAddress\",\"IPAddress\",\"CastVersion\"\n";
            content += `"${mac}","${ip}","${this.version()}"\n`;

            const result = await ECP.post("Update_Screen_IP", undefined, content, "device.csv");

            if (result) {
                return response.status(200).send({
                    address: ip,
                    result,
                    time: new Date().toISOString(),
                });
            }
        }

        return response.status(200).send({
            address: ip,
            result: {},
            time: new Date().toISOString(),
        });
    }

    async boardInfo(_request, response) {
        const mac = await this.mac();
        const system = await SystemInfo.system();

        if (system && system.manufacturer && system.manufacturer !== "" && system.manufacturer !== Player.manufacturer) {
            let content = "";
            content += "\"MACAddress\",\"CastVersion\",\"Manufacturer\",\"Board\",\"BoardVersion\"\n";
            content += `"${mac}","${this.version()}","${system.manufacturer}","${system.model || ""}","${system.version || ""}"\n`;
            const results = await ECP.post("Cast_Update_BoardInfo", undefined, content, "device.csv"); 

            if (results) {
                Player.manufacturer = system.manufacturer;
                
                return response.status(200).send({
                    result: Player,
                    time: new Date().toISOString(),
                });
            }
        }

        return response.status(200).send({
            result: {},
            time: new Date().toISOString(),
        });
    }

    async unregistered(request, response) {
        const data = (await ECP.get("Get_Unregistered_Screen", [`parameters=F:EncompassID~V:${request.query.encompassId}~O:E|F:Name~V:${request.query.name}~O:E`]))[0] || {};

        const result = {
            player: parseInt(data.ZZ_SignagePlayersID, 10),
            encompassId: data.EncompassID_DBValue,
            name: data.Name
        };

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async register(request, response) {
        Player.player = parseInt(request.body.player, 10);
        Player.code = request.body.code;
        Player.encompassId = request.body.encompassId;
        Player.name = request.body.name;

        if (!Player.name || Player.name === "") response.status(200).send({time: new Date().toISOString()});
        if (!Player.encompassId || Player.encompassId === "") response.status(200).send({time: new Date().toISOString()});

        let content = "";
        content += "\"SignagePlayerID\",\"EncompassID\",\"Name\"\n";
        content += `"${Player.player}","${Player.encompassId}","${Player.name}"\n`;

        const result = await ECP.post("Pair_Screen", undefined, content, "player.csv");

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async save(request, response) {
        Player.player = parseInt(request.body.player, 10);
        Player.code = request.body.code;
        Player.encompassId = request.body.encompassId;
        Player.name = request.body.name;

        if (!Player.name || Player.name === "") response.status(200).send({time: new Date().toISOString()});
        if (!Player.encompassId || Player.encompassId === "") response.status(200).send({time: new Date().toISOString()});

        let content = "";
        content += "\"SignagePlayerID\",\"Name\",\"URL\",\"DisplayURL\",\"PlayerType\",\"Status\"\n";
        content += `"${Player.player}","${Player.name}","","","3","1"\n`;

        const result = await ECP.post("Update_Screen", undefined, content, "player.csv");

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async cameras(request, response) {
        const player = Player.player || request.query.player;

        let cameras = (await ECP.get("Cast_Get_Cameras", [`Parameters=F:ZZ_SignagePlayersID~V:${player}~O:E`])) || [];

        if (cameras.length > 0) {
            cameras = cameras.map((camera) => {
                return {
                    id: parseInt(camera.ZZ_EncompassCastCamerasID, 10),
                    player: player,
                    name: camera.Name,
                    mac: camera.MACAddress_DBValue,
                    address: camera.IPAddress_DBValue,
                    rtspUrl: camera.RTSPURL_DBValue,
                    status: parseInt(camera.Status_DBValue, 10),
                    localWcsId: camera.LocalWCSID_DBValue
                };
            });

            return response.status(200).send({
                results: cameras,
                time: new Date().toISOString(),
            });
        }

        return response.status(200).send({
            results: [],
            time: new Date().toISOString(),
        })
    }

    async addCamera(request, response) {
        const cameras = request.body.cameras;

        if (!cameras) {
            return response.status(200).send({
                result: {},
                time: new Date().toISOString(),
            });
        }

        let content = "";
        content += "\"player\",\"name\",\"mac\",\"address\",\"rtsp\",\"localWcsId\",\"status\"\n";

        for (let i = 0; i < cameras.length; i += 1) {
            const camera = cameras[i];
            content += `"${camera.player}","${camera.name}","${camera.mac}","${camera.address}","${camera.rtspUrl}","${parseInt(camera.localWcsId, 10) ? camera.localWcsId : 0}","${camera.status}"\n`;
        }

        const result = await ECP.post("Cast_Cameras_Create", undefined, content, "cameras.csv");

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async updateCamera(request, response) {
        const cameras = request.body.cameras;

        if (!cameras) {
            return response.status(200).send({
                result: {},
                time: new Date().toISOString(),
            });
        }

        let content = "";
        content += "\"camId\",\"player\",\"name\",\"mac\",\"address\",\"rtsp\",\"localWcsId\",\"status\"\n";

        for (let i = 0; i < cameras.length; i += 1) {
            const camera = cameras[i];

            content += `"${camera.id}","${camera.player}","${camera.name}","${camera.mac}","${camera.address}","${camera.rtspUrl}","${parseInt(camera.localWcsId, 10) ? camera.localWcsId : 0}","${camera.status}"\n`;
        }

        const result = await ECP.post("Cast_Cameras_Update", undefined, content, "cameras.csv");

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async deleteCameras(request, response) {
        const ids = (request.query.ids || "").split(",");

        if (ids.length === 0) {
            return response.status(200).send({
                result: {},
                time: new Date().toISOString(),
            });
        }

        let content = "";
        content += "\"camId\"\n";

        for (let i = 0; i < ids.length; i += 1) {
            content += `"${ids[i]}"\n`;
        }

        const result = await ECP.post("Cast_Cameras_Delete", undefined, content, "cameras.csv");

        response.status(200).send({
            result,
            time: new Date().toISOString()
        });
    }

    async mac() {
        return new Promise((resolve) => {
            MACAddress.one((error, address) => {
                if (!error) resolve(address);

                resolve(undefined);
            });
        });
    }

    uuid() {
        const chars = "023456789ABCDEFGHIJKLMNPQRSTUVWXYZ";

        let result = "";

        for (let i = 6; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }

        return result;
    }

    version() {
        const version = "22.7.1";
        return version;
    }
}

module.exports = (app) => new Encompass(app);