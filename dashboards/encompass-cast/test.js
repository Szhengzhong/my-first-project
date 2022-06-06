/* eslint-disable */
const assert = chai.assert;
const expect = chai.expect;

const app = dashboardItem.querySelector("#app");

function reset() {
    app.id = "app";
}

it("Main", function () {
    expect(Main()).to.be.true;

    reset();

    app.id = "foobar";
    expect(Main()).to.be.false;

    reset();
});

describe("Helper Functions", function () {
    it("Timeout", function (done) {
        Timeout(function (error) {
            if (error) {
                done(error);
            } else {
                done();
            }
        }, 0);
    });

    it("KeyValue", function () {
        const values = KeyValue("Foo=Bar");
        const values_malformed = KeyValue("Foo");
        const values_null = KeyValue();

        assert(values.key === "Foo", "KeyValue key should be Foo");
        assert(values.value === "Bar", "KeyValue value should be Bar");
        expect(values_malformed).to.be.null;
        expect(values_null).to.be.null;
    });
});

describe("Data Functions", function () {
    it("ParseResponse", function () {
        expect(ParseResponse({
            "Export": {
                "Report": {
                    "Row": [{
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }, {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }]
                }
            }
        })).to.be.an("array").that.is.not.empty;

        expect(ParseResponse({
            "Export": {
                "Report": {
                    "Row": {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }
                }
            }
        })).to.be.an("array").that.is.not.empty;

        expect(ParseResponse({
            "Export": {
                "Report": {}
            }
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({
            "Export": {
                "Table": {
                    "Row": [{
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }, {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }]
                }
            }
        })).to.be.an("array").that.is.not.empty;

        expect(ParseResponse({
            "Export": {
                "Table": {
                    "Row": {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }
                }
            }
        })).to.be.an("array").that.is.not.empty;

        expect(ParseResponse({
            "Export": {
                "Table": {}
            }
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({
            "Export": {
                "FooBar": {
                    "Row": [{
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }, {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }]
                }
            }
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({
            "Export": {
                "FooBar": {
                    "Row": {
                        "Value1": "Foo",
                        "Value2": "Bar"
                    }
                }
            }
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({
            "Export": {
                "FooBar": {}
            }
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({
            "FooBar": {}
        })).to.be.an("array").that.is.empty;

        expect(ParseResponse({})).to.be.an("array").that.is.empty;
        expect(ParseResponse({})).to.be.an("array").that.is.empty;
    });

    it("FindPlayer", function () {
        expect(FindPlayer()).to.be.false;
        expect(FindPlayer({})).to.be.false;

        expect(FindPlayer.bind(123)()).to.be.false;
        expect(FindPlayer.bind(123)({})).to.be.false;

        expect(FindPlayer.bind(123)({
            SignagePlayerID: 123
        })).to.be.true;
    });

    it("EmbedURL", function () {
        assert(EmbedURL("home") === "home?EmbededDialog=True", "No query secure");
        assert(EmbedURL("home?FooBar=123") === "home?FooBar=123&EmbededDialog=True", "With query secure");
        assert(EmbedURL("home?FooBar=123&EmbededDialog=True") === "home?FooBar=123&EmbededDialog=True", "With embed secure");
        assert(EmbedURL("home?EmbededDialog=True&FooBar=123") === "home?FooBar=123&EmbededDialog=True", "Embed order secure");
        assert(EmbedURL("https://dsdlink.com/home") === "https://dsdlink.com/home", "URL secure");
        assert(EmbedURL("http://dsdlink.com/home") === "http://dsdlink.com/home", "URL");
        assert(EmbedURL("") === "?EmbededDialog=True", "Empty");
    });

    it("LoginURL", function () {
        assert(LoginURL("foo", "bar", "home") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1ob21lJTNGRW1iZWRlZERpYWxvZyUzRFRydWU=", "No query secure");
        assert(LoginURL("foo", "bar", "home?FooBar=123") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1ob21lJTNGRm9vQmFyJTNEMTIzJTI2RW1iZWRlZERpYWxvZyUzRFRydWU=", "With query secure");
        assert(LoginURL("foo", "bar", "home?FooBar=123&EmbededDialog=True") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1ob21lJTNGRm9vQmFyJTNEMTIzJTI2RW1iZWRlZERpYWxvZyUzRFRydWU=", "With embed secure");
        assert(LoginURL("foo", "bar", "home?EmbededDialog=True&FooBar=123") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1ob21lJTNGRm9vQmFyJTNEMTIzJTI2RW1iZWRlZERpYWxvZyUzRFRydWU=", "Embed order secure");
        assert(LoginURL("foo", "bar", "https://dsdlink.com/home") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1odHRwcyUzQSUyRiUyRmRzZGxpbmsuY29tJTJGaG9tZQ==", "URL secure");
        assert(LoginURL("foo", "bar", "http://dsdlink.com/home") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD1odHRwJTNBJTJGJTJGZHNkbGluay5jb20lMkZob21l", "URL");
        assert(LoginURL("foo", "bar", "") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgmVGhlbWU9MzdiNTFkMTk0YTc1MTNlNDViNTZmNjUyNGYyZDUxZjImRGVzdFVSTD0lM0ZFbWJlZGVkRGlhbG9nJTNEVHJ1ZQ==", "Empty");
        assert(LoginURL("foo$", "bar", "home?FooBar=123") === "https://images.encompass8.com/GlobalDocs/414635.html?aHR0cHM6Ly9kc2RsaW5rLmNvbS9hc3B4MS9Ib21lLmFzcHg/RGlzdHJpYnV0b3I9RFNETGluayZMb2dPblR5cGU9TG9nT24mU3R5bGU9YWNiZDE4ZGI0Y2MyZjg1Y2VkZWY2NTRmY2NjNGE0ZDgkJlRoZW1lPTM3YjUxZDE5NGE3NTEzZTQ1YjU2ZjY1MjRmMmQ1MWYyJkRlc3RVUkw9aG9tZSUzRkZvb0JhciUzRDEyMyUyNkVtYmVkZWREaWFsb2clM0RUcnVl", "Support user");
    });
});

describe("Page Functions", function () {
    it("Resize", function () {
        const content = document.getElementById("Content");
        const layout = content.querySelector(".Inner");

        Resize();

        content.id = "foobar";

        expect(Resize).to.not.throw();

        content.id = "Content";
        layout.className = "foobar";

        expect(Resize).to.not.throw();

        layout.className = "Inner";

        expect(Resize).to.not.throw();
    });

    it("GetState", function () {
        const state = GetState();

        expect(state || null).to.not.be.null;
        expect(GetState).to.not.throw();
    });

    it("SaveState", function () {
        const current = GetState();

        const state = {
            "Foo": "Bar",
            "Test": "FooBar",
            "Null": ""
        };

        SaveState(state);

        const test_state = GetState();

        assert(test_state.Foo === state.Foo, "Should save state");
        assert(test_state.Test === state.Test, "Should save state");
        expect(test_state.Null || null).to.be.null;

        SaveState();

        expect(SaveState).to.not.throw();

        SaveState(current);
    });
});

describe("Display Functions", function () {
    it("DisplayPlayers", async function () {
        if (Main()) {
            await Navigation_Handler(undefined, undefined, "Support");
            await DisplayPlayers();

            expect(DisplayPlayers).to.not.throw();
        }
    });

    it("DisplayPlayer", async function () {
        if (Main()) {
            await Navigation_Handler(undefined, undefined, "Support");
            await DisplayPlayer("22");

            expect(DisplayPlayer).to.not.throw();
        }
    });

    it("DisplayRegistration", async function () {
        if (Main()) {
            await Navigation_Handler(undefined, undefined, "Support");

            DisplayRegistration();

            expect(DisplayRegistration).to.not.throw();
        }
    });
});

describe("Data Fetchers", function () {
    it("GetPlayers", async function () {
        expect(await GetPlayers("Support")).to.be.an("array");
        expect(await GetPlayers()).to.be.an("array");
    }).timeout(5000);

    it("GetPlayer", async function () {
        expect(await GetPlayer("ABC-123"), "Happy").to.be.null;
        expect(await GetPlayer(""), "Empty").to.be.null;
        expect(await GetPlayer(), "Undefined").to.be.null;
    }).timeout(5000);
});

describe("Validators", function () {
    it("ValidatePlayerData", function () {
        expect(ValidatePlayerData({
            SignagePlayerID: 123,
            Name: "Foo Bar",
            URL: "home?FooBar=123"
        }, "Foo", "Bar")).to.not.be.null;

        expect(ValidatePlayerData({
            SignagePlayerID: 123,
            Name: "Foo Bar",
            URL: "home?FooBar=123"
        }, "", "")).to.not.be.null;

        expect(ValidatePlayerData({
            SignagePlayerID: 123,
            Name: "Foo Bar",
            URL: "home?FooBar=123"
        })).to.not.be.null;

        expect(ValidatePlayerData({
            SignagePlayerID: 123,
            URL: "home?FooBar=123"
        })).to.be.false;

        expect(ValidatePlayerData({
            Name: "Foo Bar",
            URL: "home?FooBar=123"
        })).to.be.false;

        expect(ValidatePlayerData()).to.be.false;
    });

    it("ValidateRegistrationData", function () {
        expect(ValidateRegistrationData({
            SignagePlayerID: 123,
            Name: "Foo Bar"
        })).to.not.be.null;

        expect(ValidateRegistrationData({
            SignagePlayerID: 123
        })).to.be.false;

        expect(ValidateRegistrationData({
            Name: "Foo Bar"
        })).to.be.false;

        expect(ValidateRegistrationData()).to.be.false;
    });
});

describe("Handlers", function () {
    it("Resize_Handler", function () {
        Resize_Handler();

        EC_Fmt.TriggerEvent(window, "resize");
    });

    it("State_Handler", async function () {
        if (Main()) {
            await Navigation_Handler(undefined, undefined, "Support");

            State_Handler();
            EC_Fmt.TriggerEvent(window, "popstate");

            expect(State_Handler).to.not.throw();
        }

        reset();
    });

    it("Navigation_Handler", async function () {
        if (Main()) {
            await Navigation_Handler();
            await Navigation_Handler("Players", "22");
            await Navigation_Handler("Register");
            await Navigation_Handler(undefined, undefined, "Support");

            EC_Fmt.TriggerEvent(app.querySelector("#register-button"), "click");
            EC_Fmt.TriggerEvent(app.querySelector("#back-button"), "click");
        }

        reset();
    });

    it("Record_Handler", async function () {
        if (Main()) {
            await Navigation_Handler(undefined, undefined, "Support");

            const record_one = app.querySelector(".show-player");
            const record_two = record_one.nextSibling.nextSibling;
            const record_three = record_two.nextSibling.nextSibling;
            const record_four = record_three.nextSibling.nextSibling;

            EC_Fmt.TriggerEvent(record_one.firstChild, "click");
            EC_Fmt.TriggerEvent(record_two.firstChild, "click");
            EC_Fmt.TriggerEvent(record_three.firstChild, "click");
            EC_Fmt.TriggerEvent(record_four.firstChild, "click");
        }

        reset();
    });

    it("Frame_Handler", function (done) {
        if (Main()) {
            Navigation_Handler(undefined, undefined, "Support").finally(() => {
                Frame_Handler();

                EC_Fmt.TriggerEvent(app.querySelector(".show-player").firstChild, "click");

                setTimeout(() => {
                    EC_Fmt.TriggerEvent(app.querySelector("#player-url"), "change");

                    done();
                }, 1000);
            });
        }

        reset();
    }).timeout(5000);

    it("Console_Handler", function (done) {
        if (Main()) {
            Navigation_Handler(undefined, undefined, "Support").finally(() => {
                Console_Handler();

                EC_Fmt.TriggerEvent(app.querySelector(".show-player").firstChild, "click");

                setTimeout(() => {
                    EC_Fmt.TriggerEvent(app.querySelector("#player-console"), "click");

                    done();
                }, 1000);
            });
        }

        reset();
    }).timeout(5000);

    it("CodeFormat_handler", async function () {
        if (Main()) {
            const field = app.querySelector("#new-player-code");

            field.value = "a";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "A", "Partial 1");

            field.value = "ab";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "AB", "Partial 2");

            field.value = "abc";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "ABC", "Partial 3");

            field.value = "abc1";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "ABC-1", "Partial 4");

            field.value = "abc12";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "ABC-12", "Partial 5");

            field.value = "abc123";
            EC_Fmt.TriggerEvent(field, "keyup");
            assert(field.value === "ABC-123", "Full length");
        }

        reset();
    });
});

describe("Form Handlers", function () {
    it("UpdatePlayer_Handler", async function () {
        if (Main()) {
            await UpdatePlayer_Handler({
                SignagePlayerID: 1,
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            }, "Foo", "Bar");

            await UpdatePlayer_Handler({
                SignagePlayerID: 1,
                URL: "home?FooBar=123"
            }, "Foo", "Bar");

            await Navigation_Handler("Player", "22", "Support");

            await UpdatePlayer_Handler({
                SignagePlayerID: 1,
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            }, "Foo", "Bar");

            await UpdatePlayer_Handler({
                SignagePlayerID: 1,
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            });

            await UpdatePlayer_Handler({
                SignagePlayerID: 1,
                URL: "home?FooBar=123"
            }, "Foo", "Bar");
        }

        reset();
    }).timeout(5000);

    it("RegisterPlayer_Handler", async function () {
        if (Main()) {
            await RegisterPlayer_Handler({
                SignagePlayerID: 1,
                EncompassID: "DSDLink",
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            });

            await RegisterPlayer_Handler({
                SignagePlayerID: 1,
                EncompassID: "DSDLink",
                URL: "home?FooBar=123"
            });

            await Navigation_Handler("Register", undefined, "Support");

            app.querySelector("#new-player-code").value = "ABC-123";

            await RegisterPlayer_Handler({
                SignagePlayerID: 1,
                EncompassID: "DSDLink",
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            });

            await RegisterPlayer_Handler({
                SignagePlayerID: 1,
                EncompassID: "DSDLink",
                Name: "Foo Bar",
                URL: "home?FooBar=123"
            });

            await RegisterPlayer_Handler({
                SignagePlayerID: 1,
                EncompassID: "DSDLink",
                URL: "home?FooBar=123"
            });
        }

        reset();
    }).timeout(5000);
});
