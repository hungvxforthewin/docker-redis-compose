const express = require("express");
const { createClient } = require("redis");
const app = express();
const session = require("express-session");
let RedisStore = require("connect-redis")(session);
//let redisClient = createClient({ legacyMode: true });
let redisClient = createClient({ host: "redis-server", port: 6379 });
redisClient.connect().catch();

app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: "config.SECRET",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: false, secure: false }, // mini second hour * 60 * 60 * 1000
    })
);

//Set initial visits
redisClient.set("visits", 0);

//defining the root endpoint
app.get("/", (req, res) => {
    let oldCount = req.session.count || 0;
    redisClient.get("visits", (err, visits) => {
        req.session.count = parseInt(oldCount) + 1;
        res.send("Number of visits is: " + oldCount);
        redisClient.set("visits", parseInt(oldCount) + 1);
        //console.log(req.session.count);
    });
});

//defining the root endpoint
app.get("/withoutredis", (req, res) => {
    redisClient.get("visits", (err, visits) => {
        res.send("Number of visits is: " + visits);
        redisClient.set("visits", parseInt(visits) + 1);
    });
});

//specifying the listening port
app.listen(8081, () => {
    console.log("Listening on port 8081");
});
