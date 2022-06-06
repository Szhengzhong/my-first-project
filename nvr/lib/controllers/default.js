const express = require("express");

const { join, resolve } = require("path");

module.exports = (app) => {
    app.use(express.static(join(__dirname, "../../interface")));

    app.get("*", (_request, response) => {
        response.sendFile(resolve(join(__dirname, "../../interface"), "index.html"));
    });
};
