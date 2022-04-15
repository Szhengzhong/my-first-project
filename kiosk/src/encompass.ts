import macaddress from "macaddress";
import axios from "axios";
import url from "url";

import instance from "./instance";
import credentials from "./credentials";

export default class Encompass {
    static async get(command: string, parameters: string[] | undefined): Promise<{ [key: string]: any }[]> {
        const uri = `https://api.encompass8.com/aspx1/API?EncompassID=DSDLink&APICommand=${command}&APIToken=${credentials}&${(parameters || []).join("&")}`;

        try {
            const response = ((await axios.get(uri)).data || {}).Export;

            let node = "Table";

            if ((response || {}).Report) node = "Report";

            if (response && response[node]) {
                if (response[node].Row && !Array.isArray(response[node].Row)) return [response[node].Row];

                return response[node].Row;
            }

            return [];
        } catch (error) {
            return [];
        }
    }

    static async post(command: string, parameters: string[] | undefined, content: string, filename: string): Promise<string | undefined> {
        const uri = `https://api.encompass8.com/aspx1/API?EncompassID=DSDLink&APICommand=${command}&APIToken=${credentials}&${(parameters || []).join("&")}`;

        try {
            const body = new url.URLSearchParams();

            body.append("FileName", filename);
            body.append("File", content);

            const response = await axios.post(uri, body);

            return response.data;
        } catch (error) {
            return undefined;
        }
    }

    static async register(): Promise<void> {
        const mac = await Encompass.mac();

        let registration = (await this.get("Get_Screen", [`parameters=F:MACAddress~V:${mac}~O:E`]))[0] || {};

        instance.code = Encompass.uuid();
        instance.player = parseInt(registration.ZZ_SignagePlayersID, 10);
        instance.address = registration.IPAddress;
        instance.name = registration.Name;
        instance.url = registration.URL_DBValue;

        if (registration.EncompassID === "Unregistered") {
            instance.registration = registration.Name;
        } else {
            instance.registration = undefined;
        }

        if (!instance.player) {
            let content = "";

            content += "\"EncompassID\",\"MACAddress\",\"Name\"\n";
            content += `"Unregistered","${mac}","${instance.code}"\n`;

            await this.post("Register_Screen", undefined, content, "player.csv");

            registration = (await this.get("Get_Screen", [`parameters=F:MACAddress~V:${mac}~O:E`]))[0] || {};

            instance.player = parseInt(registration.ZZ_SignagePlayersID, 10);
            instance.address = registration.IPAddress;
            instance.url = registration.URL_DBValue;
            instance.name = registration.Name;
            instance.registration = instance.code;
        }
    }

    static async logIp(ip: string): Promise<void> {
        const mac = await Encompass.mac();

        if (ip && ip !== "" && ip !== instance.address) {
            let content = "";

            content += "\"MACAddress\",\"IPAddress\"\n";
            content += `"${mac}","${ip}"\n`;

            await this.post("Update_Screen_IP", undefined, content, "device.csv");
        }
    }

    static mac(): Promise<string| undefined> {
        return new Promise((resolve) => {
            macaddress.one((error, address) => {
                if (!error) {
                    resolve(address);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    static uuid(): string {
        const chars = "023456789ABCDEFGHIJKLMNPQRSTUVWXYZ";

        let result = "";

        for (let i = 6; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }

        return result;
    }
}
