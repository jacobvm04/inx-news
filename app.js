import express from "express";
import bodyParser from "body-parser";
import knex from "knex";

import "./users/auth.js";
import userRoutes from "./users/routes.js";
import submissionRoutes from "./submissions/routes.js";

const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    searchPath: ['knex', 'public'],
});

const app = express();
app.set("db", db);

app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/submissions", submissionRoutes);

export default app;
