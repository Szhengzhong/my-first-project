import macaddress from "macaddress";
import axios from "axios";
import systemInfo from "systeminformation";

import credentials from "./credentials";

export default class B1Cast {
    static instance = {
        name: undefined,
        code: undefined,
        address: undefined,
        manufacturer: undefined,
        registration: undefined,
        player: undefined,
        url: undefined,
    };

    static version() {
        return "22.7.18";
    }

    static getApiBaseUrl() {
        return "https://localhost:5001";
    }
    static normalizeRows(rows) {
        if (!rows) return [];
        if (Array.isArray(rows)) return rows;
        if (Array.isArray(rows.Row)) return rows.Row;
        if (rows.Row && typeof rows.Row === "object") return [rows.Row];
        if (typeof rows === "object") return [rows];
        return [];
    }

    static getValue(source, keys) {
        for (let i = 0; i < keys.length; i += 1) {
            const value = source ? source[keys[i]] : undefined;
            if (value !== undefined && value !== null && value !== "") return value;
        }

        return undefined;
    }

    static getDefaultPlayer(mac) {
        return {
            B1CastPlayerID: undefined,
            TenantID: undefined,
            ExecuteURL: undefined,
            MACAddress: mac,
            Name: undefined,
            URL: undefined,
            IPAddress: undefined,
            CastVersion: B1Cast.version(),
            Manufacturer: undefined,
            Board: undefined,
            BoardVersion: undefined,
        };
    }

    static normalizePlayer(player, mac) {
        const fallback = B1Cast.getDefaultPlayer(mac);
        const merged = { ...fallback, ...(player || {}) };

        if (!merged.URL || merged.URL === "about:blank") {
            merged.URL = fallback.URL;
        }

        return merged;
    }

    static normalizePlayers(rows, mac) {
        const normalized = (rows || []).map((row) => B1Cast.normalizePlayer(row, mac));
        return normalized.length > 0 ? normalized : [];
    }

    static applyRegistration(registration) {
        
        const playerId = parseInt(B1Cast.getValue(registration, ["B1CastPlayerID", "ZZ_SignagePlayersID"]), 10);
        const tenantId = B1Cast.getValue(registration, ["TenantID", "EncompassID"]);

        B1Cast.instance.player = Number.isNaN(playerId) ? undefined : playerId;
        B1Cast.instance.address = B1Cast.getValue(registration, ["IPAddress"]);
        B1Cast.instance.manufacturer = B1Cast.getValue(registration, ["Manufacturer"]);
        B1Cast.instance.name = B1Cast.getValue(registration, ["Name"]);
        B1Cast.instance.url = B1Cast.getValue(registration, ["URL"]);
        B1Cast.instance.registration = tenantId === "Unregistered" ? B1Cast.instance.name : undefined;

        console.log("鉁?B1Cast.instance after applyRegistration:", {
            player: B1Cast.instance.player,
            name: B1Cast.instance.name,
            address: B1Cast.instance.address,
            url: B1Cast.instance.url,
            registration: B1Cast.instance.registration
        });
    }

    static async getPlayers(mac) {
        if (!mac) return undefined;

        try {
            const url = `${B1Cast.getApiBaseUrl()}/api/wcs/B1CastPlayers/GetB1CastPlayer?macAddress=${encodeURIComponent(mac)}`;
            
            const response = await axios.get(url);
            console.log("馃摝 API Response:", response.data);
            
            if (response.data?.success && response.data?.data) {
                const data = response.data.data;
                return B1Cast.normalizePlayers(Array.isArray(data) ? data : [data], mac);
            } else if (response.data?.data) {
                const data = response.data.data;
                if (Array.isArray(data)) {
                    return B1Cast.normalizePlayers(data, mac);
                } else if (data && typeof data === 'object') {
                    return B1Cast.normalizePlayers([data], mac);
                }
            } else if (Array.isArray(response.data)) {
                return B1Cast.normalizePlayers(response.data, mac);
            } else if (response.data && typeof response.data === 'object' && response.data.B1CastPlayerID) {
                return B1Cast.normalizePlayers([response.data], mac);
            }
            
            return [];
        } catch (error) {
            return undefined;
        }
    }

    static async registerScreen(mac, name) {
        const request = {
            MACAddress: mac,
            Name: name || B1Cast.instance.code || B1Cast.uuid(),
        };

        try {
            const url = `${B1Cast.getApiBaseUrl()}/api/wcs/B1CastPlayers/UpdateB1CastPlayer`;
            const response = await axios.post(url, request);
            return response.data;
        } catch (error) {
            console.error("Error registering screen:", error);
            return undefined;
        }
    }

    static async updatePlayerIP(mac, ip) {
        const request = {
            MACAddress: mac,
            IPAddress: ip,
            CastVersion: B1Cast.version(),
        };

        try {
            const url = `${B1Cast.getApiBaseUrl()}/api/wcs/B1CastPlayers/UpdateB1CastPlayer`;
            const response = await axios.post(url, request);
            return response.data;
        } catch (error) {
            console.error("Error updating player IP:", error);
            return undefined;
        }
    }

    static async updatePlayerBoardInfo(mac, system) {
        const request = {
            MACAddress: mac,
            CastVersion: B1Cast.version(),
            Manufacturer: (system && system.manufacturer) || "",
            Board: (system && system.model) || "",
            BoardVersion: (system && system.version) || "",
        };

        try {
            const url = `${B1Cast.getApiBaseUrl()}/api/wcs/B1CastPlayers/UpdateB1CastPlayer`;
            const response = await axios.post(url, request);
            return response.data;
        } catch (error) {
            console.error("Error updating board info:", error);
            return undefined;
        }
    }

    static async register() {
        const mac = await B1Cast.mac();
        console.log("Device MAC Address:", mac);
        if (!mac) return false;

        let response = await B1Cast.getPlayers(mac);
        let registration = (response && response[0]) || {};

        B1Cast.instance.code = B1Cast.uuid();
        B1Cast.applyRegistration(registration);

        if (!B1Cast.instance.player && response !== undefined) {
            await B1Cast.registerScreen(mac, B1Cast.instance.code);

            response = await B1Cast.getPlayers(mac);
            registration = (response && response[0]) || {};
            B1Cast.applyRegistration(registration);
            B1Cast.instance.registration = B1Cast.instance.code;
        }

        return true;
    }

    static async logIp(ip) {
        const mac = await B1Cast.mac();
        if (!mac) return;

        if (ip && ip !== "" && ip !== B1Cast.instance.address) {
            await B1Cast.updatePlayerIP(mac, ip);
        }
    }

    static async getBoardInfo() {
        const mac = await B1Cast.mac();
        if (!mac) return undefined;

        const system = await systemInfo.system();

        if (
            system &&
            system.manufacturer &&
            system.manufacturer !== "" &&
            system.manufacturer !== B1Cast.instance.manufacturer
        ) {
            await B1Cast.updatePlayerBoardInfo(mac, system);
        }

        return system ? system.manufacturer : undefined;
    }

    static async mac() {
        return new Promise((resolve) => {
            macaddress.one((error, address) => {
                if (!error && address) {
                    resolve(address);
                } else {
                    resolve(undefined);
                }
            });
        });
    }

    static uuid() {
        const chars = "023456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
        let result = "";
        for (let i = 6; i > 0; --i) {
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        }
        return result;
    }
}
