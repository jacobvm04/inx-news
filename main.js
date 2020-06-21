import app from "./app.js";

app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`));
