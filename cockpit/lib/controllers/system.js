const { execSync } = require("child_process");
const system = require("systeminformation");

class Mac {
    constructor(app) {
        app.get("/api/system", (request, response) => this.info(request, response));
        app.get("/api/system/cpu", (request, response) => this.cpu(request, response));
        app.get("/api/system/temperature", (request, response) => this.temperature(request, response));
        app.get("/api/system/memory", (request, response) => this.memory(request, response));
        app.get("/api/system/filesystem", (request, response) => this.filesystem(request, response));
        app.get("/api/system/activity", (request, response) => this.activity(request, response));
        app.put("/api/system/reboot", (request, response) => this.reboot(request, response));
    }

    async info(_request, response) {
        const time = new Date().toISOString();

        const results = {
            system: await system.system(),
            operating_system: await system.osInfo(),
        };

        response.send({
            results,
            time,
        });
    }

    async cpu(_request, response) {
        const time = new Date().toISOString();

        const results = {
            information: await system.cpu(),
            speed: await system.cpuCurrentspeed(),
            load: await system.currentLoad(),
            cache: await system.cpuCache(),
        };

        return response.send({
            results,
            time,
        });
    }

    async temperature(_request, response) {
        const time = new Date().toISOString();
        const results = await system.cpuTemperature();

        return response.send({
            results,
            time,
        });
    }

    async memory(_request, response) {
        const time = new Date().toISOString();

        const results = {
            information: await system.memLayout(),
            load: await system.mem(),
        };

        return response.send({
            results,
            time,
        });
    }

    async filesystem(_request, response) {
        const time = new Date().toISOString();
        const results = await system.fsSize();

        return response.send({
            results,
            time,
        });
    }

    async activity(_request, response) {
        const time = new Date().toISOString();
        const results = await system.currentLoad();

        return response.send({
            results,
            time,
        });
    }

    reboot(_request, response) {
        const time = new Date().toISOString();

        execSync("shutdown -r now");

        response.send({
            results: {
                success: true,
            },
            time,
        });
    }
}

module.exports = (app) => {
    new Mac(app);
};
