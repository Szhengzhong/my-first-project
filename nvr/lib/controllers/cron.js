const Fs = require("fs-extra");
const Path = require("path");
const JSzip = require("jszip");
const Util = require("util");
const Exec = Util.promisify(require("child_process").exec);

const Log = require("../logger");
const ECP = require("./ecp");

class Cron {
    constructor(app) {
        app.get("/api/send", (request, response) => this.send(request, response));
        app.post("/api/cron", (request, response) => this.setup(request, response));
    }

    async send(request, response) {
        const path = request.query.path || "/media/camfeeds";
        
        if (!Fs.existsSync(path)) {
            return response.status(200).send({
                result: {},
                time: new Date().toISOString(),
            });
        }

        Log.info("cron", "remove ./test.");

        const testPath = Path.join(path, "test");    

        if (Fs.existsSync(testPath)) {
            Fs.rmSync(testPath, { recursive: true, force: true });
        }

        Log.info("cron", "make ./test.");

        Fs.mkdirSync(testPath);

        const files = Fs
            .readdirSync(path, { withFileTypes: true })
            .filter((file) => file.name.match(/(^cam)+([0-9\s_\\.\-\(\):])+(.mp4)$/));

        Log.info("cron", `${files.length} files found.`);
        Log.info("cron", "writing CSV & moving files.");        

        let content = "";
        content += "\"FileName\",\"Table\",\"KeyField\",\"KeyValue\",\"ForeignValue\"\n";

        const current = new Date().getTime();
        const startTime = new Date(current - (60 * 60 * 1000)).getTime(); // 1 hour ago

        Log.info("cron", `Current Time = ${ current.toLocaleString() }`); 
        Log.info("cron", `Start Time = ${ startTime.toLocaleString() }`); 

        let size = 0;
        const maxSize = 2 * 1024 * 1024 * 1024; // 2 GB

        for (let i = 0; i < files.length; i += 1) {
            const stat = Fs.statSync(Path.join(path, files[i].name));
            const mtime = stat.mtime.getTime()

            Log.info("cron", `File Name = ${ files[i].name } mtime: ${ mtime.toLocaleString() } size: ${ stat.size }`); 
            
            if ((mtime < startTime) && (size < maxSize)) {
                size += stat.size;
                Fs.moveSync(Path.join(path, files[i].name), Path.join(testPath, files[i].name), {
                    overwrite: true,
                    force: true,
                });
    
                const cameraId = files[i].name.replace("cam", "").split("-").shift();
                content += `"${files[i].name}","ZZ_EncompassCastCameras","ZZ_EncompassCastCamerasID","${cameraId}","${cameraId}"\n`;
            }            
        }

        Fs.writeFileSync(Path.join(testPath, "file.csv"), content, "utf-8");

        Log.info("cron", "starting zip");

        const zipName = "cam.zip";

        if (Fs.existsSync(Path.join(path, zipName))) {
            Fs.rmSync(Path.join(path, zipName), { force: true });
        }

        const zip = new JSzip();
        Fs.readdirSync(testPath, { withFileTypes: true })
            .map((file) => file.name)
            .forEach((name) => {
                zip.file(name, Fs.readFileSync(Path.join(testPath, name)));
            });

        await new Promise((resolve) => {
            zip.generateAsync({ type: "uint8array" })
                .then((content) => {
                    Fs.writeFileSync(Path.join(path, zipName), content);
                    resolve();
                })
                .catch((error) => Log.error(error));
        });

        Log.info("cron", "zip complete");
        Log.info("cron", "starting upload");

        const result = await ECP.postZip("Cast_Cameras_Attachments", path, zipName);
        
        Log.info("cron", `result: ${result}`);
        
        response.status(200).send({
            result,
            time: new Date().toISOString(),
        });
    }

    async setup(request, response) {
        const path = request.body.path || "/media/camfeeds";
        const port = request.body.port || "5050"
        const player = request.body.player || undefined;
        const cameras = request.body.cameras || [];
        
        console.log(path, player, cameras);

        Log.info("cron", "Checking required data is present");

        if (!player || cameras.length === 0) {
            return response.status(200).send({
                result: {},
                time: new Date().toISOString(),
            });
        }

        Log.info("cron", "Checking directory exists");

        if (!Fs.existsSync(path)) {
            Fs.mkdirSync(path);
        }

        Log.info("cron", "Checking bash script exists");

        const ffmpegscript = "ffmpegscript.sh"

        if (Fs.existsSync(Path.join(path, ffmpegscript))) {
            Fs.rmSync(Path.join(path, ffmpegscript), { force: true });
        }

        Log.info("cron", "Writing new bash script");

        let ffmpegcontent = "";
        ffmpegcontent += "#!/bin/bash\n";

        for (let i = 0; i < cameras.length; i += 1) {
            const camera = cameras[i];
            ffmpegcontent += `ffmpeg -i ${camera.rtspUrl} -hide_banner -loglevel error -vcodec copy -r 60 -t 3540 -y ${path}/cam${camera.id}-$(date +\%Y\%m\%d-\%H_\%M).mp4`

            if (i !== cameras.length - 1) ffmpegcontent += " & \n"
        }

        Fs.writeFileSync(Path.join(path, ffmpegscript), ffmpegcontent, "utf-8");

        Log.info("cron", "Updating bash script permissions.");

        try {
            await Exec(`chmod 755 ${Path.join(path, ffmpegscript)}`);
        } catch (error) {
            Log.error(error);
        }

        Log.info("cron", "Checking CURL script exists");

        const curlscript = "curlscript.sh"

        if (Fs.existsSync(Path.join(path, curlscript))) {
            Fs.rmSync(Path.join(path, curlscript), { force: true });
        }

        Log.info("cron", "Writing new CURL script");

        let curlcontent = "";
        curlcontent += "#!/bin/bash\n";
        curlcontent += `curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://localhost:${port}/api/send?path=${encodeURI(path)}\n`;

        Fs.writeFileSync(Path.join(path, curlscript), curlcontent, "utf-8");

        Log.info("cron", "Updating CURL script permissions.");

        try {
            await Exec(`chmod 755 ${Path.join(path, curlscript)}`);
        } catch (error) {
            Log.error(error);
        }

        Log.info("cron", "Checking IP Config exists");

        const ipscript = "ipscript.sh";

        if (Fs.existsSync(Path.join(path, ipscript))) {
            Fs.rmSync(Path.join(path, ipscript), { force: true });
        }

        Log.info("cron", "Writing IP Config script");

        let ipcontent = "";
        ipcontent += "#!/bin/bash\n";
        ipcontent += `curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://localhost:${port}/api/ip\n`;

        Fs.writeFileSync(Path.join(path, ipscript), ipcontent, "utf-8");

        Log.info("cron", "Updating IP config permissions.");

        try {
            await Exec( `chmod 755 ${Path.join(path, ipscript)}`);
        } catch (error) {
            Log.error(error);
        }

        Log.info("cron", "Writing Cron Job Scheduler");

        let cronjobContent = "";
        cronjobContent += "SHELL=/bin/sh\n";
        cronjobContent += "PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n";
        cronjobContent += "# m h  dom mon dow   command\n";
        cronjobContent += `30 * * * * ${path}/${ffmpegscript}\n`;
        cronjobContent += `0 * * * * ${path}/${curlscript}\n`

        const cronjobName = "crontab.sh";

        Fs.writeFileSync(Path.join(path, cronjobName), cronjobContent);

        Log.info("cron", "Updating crontab using scheduler");

        try {
            await Exec(`crontab ${ Path.join(path, cronjobName) }`);
        } catch (error) {
            Log.error(error);
        }

        Log.info("cron", "Removing Cron Job Scheduler");
        Fs.rmSync(Path.join(path, cronjobName), { force: true });

        return response.status(200).send({
            result: "success",
            time: new Date().toISOString(),
        });
    }
}

module.exports = (app) => new Cron(app);