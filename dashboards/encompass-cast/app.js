let app = null;

/*
* HELPER FUNCTIONS
*/

function Timeout(callback, interval) {
    setTimeout(callback, interval);
}

function KeyValue(value) {
    const parts = (value || "").split("=");

    return parts.length >= 2 ? { key: parts[0], value: parts[1] } : null;
}

/*
* DATA FUNCTIONS
*/

function ParseResponse(response) {
    if (!response || !response.Export) return [];

    let node = "Table";

    if (response && response.Export.Report) node = "Report";
    if (!response.Export[node]) return [];
    if (response.Export[node].Row && !Array.isArray(response.Export[node].Row)) return [response.Export[node].Row];

    return response.Export[node].Row || [];
}

function FindPlayer(item) {
    if (!item || !Object.prototype.hasOwnProperty.call(item, "SignagePlayerID")) return false;

    return (item || {}).SignagePlayerID === this;
}

function EmbedURL(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        const parts = url.split("?");
        const parameters = parts.length > 1 ? (parts[1] || "").split("&") : [];

        url = parts[0];

        if (parameters.length > 0) url += "?";

        for (let i = 0; i < parameters.length; i++) {
            if (!parameters[i].toLowerCase().startsWith("embededdialog=")) url += parameters[i];
        }

        if (url.indexOf("?") >= 0) {
            url += "&";
        } else {
            url += "?";
        }

        url += "EmbededDialog=True";
    }

    return url;
}

function LoginURL(username, password, url) {
    let support = false;

    username = username.toLowerCase().trim();

    if (username.endsWith("$")) {
        username = username.slice(0, -1);
        support = true;
    }

    const email = EC_Fmt.isEmail(username);

    username = EC_Fmt.MD5(username);
    password = EC_Fmt.MD5(password);

    if (support) username += "$";
    if (email) username = `@${username}`;

    return `https://images.encompass8.com/GlobalDocs/414635.html?${btoa(`https://${window.location.host}/aspx1/Home.aspx?Distributor=${Distributor}&LogOnType=LogOn&Style=${username}&Theme=${password}&DestURL=${encodeURIComponent(EmbedURL(url))}`)}`;
}

/*
* PAGE FUNCTIONS
*/

function Resize() {
    const content = document.getElementById("Content");

    if (dashboardItem instanceof HTMLElement && content instanceof HTMLElement) {
        const layout = content.querySelector(".Inner");

        if (layout instanceof HTMLElement) {
            layout.style.overflow = "hidden";
            dashboardItem.style.height = `${layout.clientHeight}px`;
            dashboardItem.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
        }
    }
}

function GetState() {
    const parameters = window.location.href.split("?").pop().split("&");
    const results = {};

    for (let i = 0; i < parameters.length; i++) {
        const parameter = KeyValue(parameters[i]);

        if (parameter) results[parameter.key] = decodeURIComponent(parameter.value);
    }

    return results;
}

function SaveState(state) {
    const parameters = [];
    const keys = Object.keys(state || {});
    const current = window.location.href.split("/").pop();

    for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== "" && (state[keys[i]] || "") !== "") parameters.push(`${keys[i]}=${encodeURIComponent(state[keys[i]])}`);
    }

    if (current !== `Home?${parameters.join("&")}`) window.history.pushState(state, "Encompass", `Home?${parameters.join("&")}`);
}

/*
* DISPLAY FUNCTIONS
*/

async function DisplayPlayers() {
    if (!(app.data instanceof HTMLElement)) return;

    app.data_table.style.display = "none";
    app.data_record.style.display = "none";
    app.data_register.style.display = "none";
    app.data_spinner.style.display = "flex";
    app.register_button.style.display = "flex";
    app.back_button.style.display = "none";

    let html = "";

    for (let i = 0; i < app.players.length; i++) {
        const { ...row } = app.players[i];

        html += `
            <tr class="show-player" value="${row.SignagePlayerID}">
                <td class="em-cell">${row.Name}</td>
            </tr>
        `;
    }

    app.data_records.innerHTML = html;
    app.data_table.style.display = "table";
    app.data_spinner.style.display = "none";
}

function DisplayPlayer(PlayerID) {
    app.data_table.style.display = "none";
    app.data_record.style.display = "none";
    app.data_register.style.display = "none";
    app.data_spinner.style.display = "flex";
    app.register_button.style.display = "none";
    app.back_button.style.display = "flex";

    app.current_player = app.players.filter(FindPlayer.bind(parseInt(PlayerID, 10)))[0];

    if (!app.current_player) return;

    let url = app.current_player.URL;
    let preview = true;

    if (url.startsWith("https://images.encompass8.com/GlobalDocs/414635.html")) {
        const loader = atob(url.split("?").pop());
        const parameters = loader.split("?").pop().split("&");

        preview = false;

        if ((loader.split("?")[0] || "").split("/")[2] === window.location.host) preview = true;

        for (let i = 0; i < parameters.length; i++) {
            const pair = parameters[i].split("=");

            if (pair[0].toLowerCase() === "desturl") url = (decodeURIComponent(pair[1]) || "").replace(/&EmbededDialog=True/gi, "").replace(/\?EmbededDialog=True/gi, "");
        }
    }

    app.data_record.querySelector("#screen-frame").style.display = "none";
    app.data_record.querySelector("#form-validation").style.display = "none";
    app.data_record.querySelector("#form-message").innerHTML = "";
    app.data_record.querySelector("#player-title").innerHTML = app.current_player.Name;
    app.data_record.querySelector("#player-name").value = app.current_player.Name;
    app.data_record.querySelector("#player-url").value = url !== "https://cdn.e8.co/Support/S3Images/8cb7915fefc3f1b9b9b6db1513fae7d9.html" ? url : "";
    app.data_record.querySelector("#player-username").value = "";
    app.data_record.querySelector("#player-password").value = "";
    app.data_record.querySelector("#screen-frame").setAttribute("src", "about:blank");

    if (preview) {
        app.data_record.querySelector("#screen-frame").setAttribute("src", EmbedURL(url));
        app.data_record.querySelector("#screen-frame").style.display = "block";
    }

    app.data_record.style.display = "block";
    app.data_spinner.style.display = "none";
}

function DisplayRegistration() {
    app.data_table.style.display = "none";
    app.data_record.style.display = "none";
    app.data_register.style.display = "none";
    app.data_spinner.style.display = "flex";
    app.register_button.style.display = "none";
    app.back_button.style.display = "flex";

    app.data_register.querySelector("#form-validation").style.display = "none";
    app.data_register.querySelector("#form-message").innerHTML = "";
    app.data_register.querySelector("#new-player-name").value = "";
    app.data_register.querySelector("#new-player-code").value = "";

    app.data_register.style.display = "block";
    app.data_spinner.style.display = "none";
}

/*
* DATA FETCHERS
*/

async function GetPlayers(EncompassID) {
    const results = [];
    const request = new ECP.EC_Request("Get_Screen_List");

    request.SetEncompassID("DSDLink");
    request.SetAPIToken("cf8ab099f6e72314e780779916c9846a");

    request.AddParameter("EncompassID", EncompassID || Distributor, ECP.EC_Operator.Equals);

    const data = ParseResponse(await request.Submit());

    for (let i = 0; i < data.length; i++) {
        const { ...row } = data[i];

        results.push({
            SignagePlayerID: parseInt(row.ZZ_SignagePlayersID, 10),
            IPAddress: row.IPAddress,
            Name: row.Name,
            URL: row.URL
        });
    }

    return results;
}

async function GetPlayer(code) {
    const request = new ECP.EC_Request("Get_Unregistered_Screen");

    request.SetEncompassID("DSDLink");
    request.SetAPIToken("cf8ab099f6e72314e780779916c9846a");

    request.AddParameter("EncompassID", "Unregistered", ECP.EC_Operator.Equals);
    request.AddParameter("Name", (code || "").toUpperCase().replace(/-/gi, ""), ECP.EC_Operator.Equals);

    let results = null;

    const data = ParseResponse(await request.Submit());

    if (data.length > 0) results = parseInt(data[0].ZZ_SignagePlayersID, 10);

    return results;
}

/*
* VALIDATORS
*/

function ValidatePlayerData(data, username, password) {
    if (!data) return false;

    app.data_record.querySelector("#form-validation").style.display = "none";
    app.data_record.querySelector("#form-message").innerHTML = "";

    if (!data.SignagePlayerID || Number.isNaN(data.SignagePlayerID)) {
        app.data_record.querySelector("#form-validation").style.display = "block";
        app.data_record.querySelector("#form-message").innerHTML = "Invalid player.";

        return false;
    }

    if (!data.Name) {
        app.data_record.querySelector("#form-validation").style.display = "block";
        app.data_record.querySelector("#form-message").innerHTML = "Screen Name is required.";

        return false;
    }

    if (data.URL.startsWith(`https://${window.location.host}`) || data.URL.startsWith(`http://${window.location.host}`)) {
        data.URL = data.URL.split("/aspx1/").pop();
    }

    if (username && password) {
        data.URL = LoginURL(username, password, data.URL);
    }

    if (!data.URL) data.URL = "https://cdn.e8.co/Support/S3Images/8cb7915fefc3f1b9b9b6db1513fae7d9.html";

    return data;
}

function ValidateRegistrationData(data) {
    if (!data) return false;

    app.data_register.querySelector("#form-validation").style.display = "none";
    app.data_register.querySelector("#form-message").innerHTML = "";

    if (!data.SignagePlayerID || Number.isNaN(data.SignagePlayerID)) {
        app.data_register.querySelector("#form-validation").style.display = "block";
        app.data_register.querySelector("#form-message").innerHTML = "Invalid registration code.";

        return false;
    }

    if (!data.Name) {
        app.data_register.querySelector("#form-validation").style.display = "block";
        app.data_register.querySelector("#form-message").innerHTML = "Screen Name is required.";

        return false;
    }

    if (!data.URL) data.URL = "https://cdn.e8.co/Support/S3Images/8cb7915fefc3f1b9b9b6db1513fae7d9.html";

    return data;
}

/*
* HANDLERS
*/

function Resize_Handler() {
    Timeout(Resize, 10);
}

function State_Handler() {
    app.state = GetState();

    Navigation_Handler(app.state.Action, app.state.PlayerID);
}

async function Navigation_Handler(Action, PlayerID, EncompassID) {
    if (Action instanceof Event) {
        PlayerID = Action.currentTarget.getAttribute("value");
        Action = Action.currentTarget.getAttribute("action");
    }

    app.players = await GetPlayers(EncompassID);

    app.state.Action = Action;
    app.state.PlayerID = PlayerID;

    SaveState(app.state);

    switch (app.state.Action) {
        case "Player":
            DisplayPlayer(app.state.PlayerID);
            break;

        case "Register":
            DisplayRegistration();
            break;

        default:
            await DisplayPlayers();
            break;
    }
}

function Record_Handler(event) {
    let target = null;

    if (event.target.parentElement.className === "show-player") {
        target = event.target.parentElement;
    } else if (event.target.parentElement.parentElement.className === "show-player") {
        target = event.target.parentElement.parentElement;
    }

    if (target && !Number.isNaN(parseInt(target.getAttribute("value") || "", 10))) Navigation_Handler("Player", target.getAttribute("value"));
}

function Frame_Handler(event) {
    if (!event || !event.currentTarget) return;

    let url = event.currentTarget.value;

    if (url) {
        if (url.startsWith(`https://${window.location.host}`) || url.startsWith(`http://${window.location.host}`)) {
            url = url.split("/aspx1/").pop().replace(/&EmbededDialog=True/gi, "").replace(/\?EmbededDialog=True/gi, "");

            event.currentTarget.value = url;
        }

        app.data_record.querySelector("#screen-frame").setAttribute("src", EmbedURL(url));
    } else {
        app.data_record.querySelector("#screen-frame").setAttribute("src", "https://cdn.e8.co/Support/S3Images/8cb7915fefc3f1b9b9b6db1513fae7d9.html");
    }
}

function Console_Handler() {
    if (!app.current_player || !app.current_player.IPAddress) {
        ECP.Dialog.Alert("Unable to open console. You must be on the same network.");

        return;
    }

    window.open(`http://${app.current_player.IPAddress}:8080`);
}

function CodeFormat_handler(event) {
    const code = event.currentTarget.value;

    if (code) event.currentTarget.value = code.toUpperCase().replace(/-/gi, "").match(/.{1,3}/g).join("-");
}

/*
* FORM HANDLERS
*/

async function UpdatePlayer_Handler(TestData, TestUsername, TestPassword) {
    if (TestData instanceof Event) {
        TestData = null;
        TestUsername = null;
        TestPassword = null;
    }

    if (!app.current_player) return;

    const username = app.data_record.querySelector("#player-username").value;
    const password = app.data_record.querySelector("#player-password").value;

    const data = ValidatePlayerData(TestData || {
        SignagePlayerID: app.current_player.SignagePlayerID,
        Name: app.data_record.querySelector("#player-name").value,
        URL: app.data_record.querySelector("#player-url").value
    }, TestUsername || username, TestPassword || password);

    if (data) {
        app.data_record.style.display = "none";
        app.data_spinner.style.display = "flex";
        app.register_button.style.display = "none";
        app.back_button.style.display = "none";

        let content = "";

        content += "\"SignagePlayerID\",\"Name\",\"URL\"\n";
        content += `"${data.SignagePlayerID}","${data.Name}","${data.URL}"\n`;

        const body = new FormData();

        body.append("FileName", "player-config.csv");
        body.append("File", content);

        const response = await fetch("https://api.encompass8.com/aspx1/API.ashx?EncompassID=DSDLink&APICommand=Update_Screen&APIToken=cf8ab099f6e72314e780779916c9846a", {
            method: "POST",
            mode: "no-cors",
            body
        });

        await response.text();

        Navigation_Handler("Player", `${data.SignagePlayerID}`);
    }
}

async function RegisterPlayer_Handler(TestData) {
    if (TestData instanceof Event) TestData = null;

    const player = await GetPlayer(app.data_register.querySelector("#new-player-code").value);

    const data = ValidateRegistrationData(TestData || {
        SignagePlayerID: player,
        EncompassID: Distributor,
        Name: app.data_register.querySelector("#new-player-name").value,
        URL: "https://cdn.e8.co/Support/S3Images/8cb7915fefc3f1b9b9b6db1513fae7d9.html"
    });

    if (data) {
        app.data_register.style.display = "none";
        app.data_spinner.style.display = "flex";
        app.register_button.style.display = "none";
        app.back_button.style.display = "none";

        let content = "";

        content += "\"SignagePlayerID\",\"EncompassID\",\"Name\"\n";
        content += `"${data.SignagePlayerID}","${data.EncompassID}","${data.Name}"\n`;

        let body = new FormData();

        body.append("FileName", "player-pairing.csv");
        body.append("File", content);

        let response = await fetch("https://api.encompass8.com/aspx1/API.ashx?EncompassID=DSDLink&APICommand=Pair_Screen&APIToken=cf8ab099f6e72314e780779916c9846a", {
            method: "POST",
            mode: "no-cors",
            body
        });

        await response.text();

        content = "";

        content += "\"SignagePlayerID\",\"Name\",\"URL\"\n";
        content += `"${data.SignagePlayerID}","${data.Name}","${data.URL}"\n`;

        body = new FormData();

        body.append("FileName", "player-config.csv");
        body.append("File", content);

        response = await fetch("https://api.encompass8.com/aspx1/API.ashx?EncompassID=DSDLink&APICommand=Update_Screen&APIToken=cf8ab099f6e72314e780779916c9846a", {
            method: "POST",
            mode: "no-cors",
            body
        });

        await response.text();

        Navigation_Handler("Player", `${data.SignagePlayerID}`);
    }
}

/*
* MAIN
*/

function Main() {
    app = dashboardItem.querySelector("#app");

    if (!(app instanceof HTMLElement)) return false;

    app.content = app.querySelector("#cast-content");
    app.header = app.content.querySelector("#cast-header");
    app.register_button = app.header.querySelector("#register-button");
    app.back_button = app.header.querySelector("#back-button");
    app.layout = app.content.querySelector("#cast-layout");
    app.data = app.layout.querySelector("#cast-data");
    app.data_spinner = app.data.querySelector("#data-spinner");
    app.data_table = app.data.querySelector("#cast-players");
    app.data_records = app.data.querySelector("#cast-player-records");
    app.data_record = app.data.querySelector("#cast-player");
    app.data_register = app.data.querySelector("#cast-register");

    app.state = GetState();

    Resize();

    window.addEventListener("resize", Resize_Handler);
    window.addEventListener("popstate", State_Handler);
    app.data_records.addEventListener("click", Record_Handler);
    app.register_button.addEventListener("click", Navigation_Handler);
    app.back_button.addEventListener("click", Navigation_Handler);
    app.data_record.querySelector("#player-url").addEventListener("change", Frame_Handler);
    app.data_record.querySelector("#player-console").addEventListener("click", Console_Handler);
    app.data_record.querySelector("#player-save-changes").addEventListener("click", UpdatePlayer_Handler);
    app.data_register.querySelector("#register-player").addEventListener("click", RegisterPlayer_Handler);
    app.data_register.querySelector("#new-player-code").addEventListener("keyup", CodeFormat_handler);

    app.style.opacity = 1;

    Navigation_Handler(app.state.Action, app.state.PlayerID);

    return true;
}

Main();
