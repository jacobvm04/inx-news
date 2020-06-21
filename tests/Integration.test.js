import "regenerator-runtime";
import request from "supertest";
import app from "../app.js";
import passport from 'passport';

describe("Integration Tests", () => {
   beforeAll(async () => {
       const db = app.get("db");

       await db
           .from("users")
           .del();

       await db
           .from("submissions")
           .del();
   });

    afterAll(async () => {
        const db = app.get("db");

        await db
            .from("users")
            .del();

        await db
            .from("submissions")
            .del();
    });

   test("Integration Test 1", async () => {
       const registrationResponse = await request(app)
           .post("/users/register")
           .send({
               username: process.env.TEST_USERNAME,
               password: process.env.TEST_PASSWORD,
           })
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(registrationResponse.statusCode).toBe(201);
       expect(registrationResponse.body.user.username).toBe(process.env.TEST_USERNAME);


       const registrationResponse2 = await request(app)
           .post("/users/register")
           .send({
               username: process.env.TEST_USERNAME,
               password: process.env.TEST_PASSWORD,
           })
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(registrationResponse2.statusCode).toBe(422);


       const loginResponse = await request(app)
           .post("/users/login")
           .send({
               username: process.env.TEST_USERNAME,
               password: process.env.TEST_PASSWORD,
           })
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(loginResponse.statusCode).toBe(200);

       const token = loginResponse.body.token;


       const loginResponse2 = await request(app)
           .post("/users/login")
           .send({
               username: process.env.TEST_USERNAME,
               password: "not the correct password",
           })
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(loginResponse2.statusCode).toBe(403);
       expect(loginResponse2.body.message).toBe("Invalid password");

       const loginResponse3 = await request(app)
           .post("/users/login")
           .send({
               username: "not the correct username",
               password: process.env.TEST_PASSWORD,
           })
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(loginResponse3.statusCode).toBe(403);
       expect(loginResponse3.body.message).toBe("Invalid username");


       app.get("/secure", passport.authenticate("jwt", { session: false }), async (req, res) => {
            res.json(req.user);
       });

       const secureResponse = await request(app)
           .get("/secure")
           .set("Authorization", `Bearer ${token}`)
           .set("Accept", "application/json");

       expect(secureResponse.statusCode).toBe(200);
       expect(secureResponse.body.username).toBe(process.env.TEST_USERNAME);


       const secureResponse2 = await request(app)
           .get("/secure")
           .set("Authorization", `Bearer invalid token`)
           .set("Accept", "application/json");

       expect(secureResponse2.statusCode).toBe(401);

       const secureResponse3 = await request(app)
           .get("/secure")
           .set("Accept", "application/json");

       expect(secureResponse2.statusCode).toBe(401);


       const createSubmissionResponse = await request(app)
           .post("/submissions")
           .send({
               title: "Rents are dropping across the US",
               link: "https://edition.cnn.com/2020/06/16/success/rents-are-dropping-us-cities-coronavirus/index.html",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createSubmissionResponse.statusCode).toBe(201);
       expect(createSubmissionResponse.body.submission.title).toBe("Rents are dropping across the US");
       expect(typeof createSubmissionResponse.body.submission.id).toBe("number");

       const postId = createSubmissionResponse.body.submission.id;


       const createSubmissionResponse2 = await request(app)
           .post("/submissions")
           .send({
               link: "https://edition.cnn.com/2020/06/16/success/rents-are-dropping-us-cities-coronavirus/index.html",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createSubmissionResponse2.statusCode).toBe(422);


       const createSubmissionResponse3 = await request(app)
           .post("/submissions")
           .send({
               title: "Rents are dropping across the US",
               link: "invalid url",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createSubmissionResponse3.statusCode).toBe(422);


       const createSubmissionResponse4 = await request(app)
           .post("/submissions")
           .send({
               title: "Rents are dropping across the US",
               link: "invalid url",
           })
           .set("Authorization", `invalid token`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createSubmissionResponse4.statusCode).toBe(401);


       const upvoteSubmissionResponse = await request(app)
           .patch(`/submissions/${postId}`)
           .set("Authorization", `Bearer ${token}`)
           .set("Accept", "application/json");

       expect(upvoteSubmissionResponse.statusCode).toBe(200);

       const upvoteSubmissionResponse2 = await request(app)
           .patch(`/submissions/yeet`)
           .set("Authorization", `Bearer ${token}`)
           .set("Accept", "application/json");

       expect(upvoteSubmissionResponse2.statusCode).toBe(500);


       await request(app)
           .post("/submissions")
           .send({
               title: "NO rents are dropping across the US",
               link: "https://edition.cnn.com/2020/06/16/success/rents-are-dropping-us-cities-coronavirus/index.html",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       const getSubmissionsResponse = await request(app)
           .get("/submissions")
           .set("Accept", "application/json");

       expect(getSubmissionsResponse.statusCode).toBe(200);
       expect(getSubmissionsResponse.body.submissions[1].title).toBe("NO rents are dropping across the US");
       expect(getSubmissionsResponse.body.submissions[0].title).toBe("Rents are dropping across the US");


       const getSubmissionResponse = await request(app)
           .get(`/submissions/${postId}`)
           .set("Accept", "application/json");

       expect(getSubmissionResponse.statusCode).toBe(200);
       expect(getSubmissionResponse.body.submission.title).toBe("Rents are dropping across the US");
       expect(getSubmissionResponse.body.comments.length).toBe(0);


       const getSubmissionResponse2 = await request(app)
           .get(`/submissions/234234`)
           .set("Accept", "application/json");

       expect(getSubmissionResponse2.statusCode).toBe(200);
       expect(getSubmissionResponse2.body.submission).toBe(undefined);
       expect(getSubmissionResponse2.body.comments.length).toBe(0);


       const createCommentResponse = await request(app)
           .post(`/submissions/${postId}`)
           .send({
               content: "This is a great article!",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createCommentResponse.statusCode).toBe(201);
       expect(createCommentResponse.body.comment.content).toBe("This is a great article!");
       expect(typeof createCommentResponse.body.comment.id).toBe("number");


       const createCommentResponse2 = await request(app)
           .post(`/submissions/${postId}`)
           .send({})
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createCommentResponse2.statusCode).toBe(422);


       const createCommentResponse3 = await request(app)
           .post(`/submissions/123123`)
           .send({
               content: "Great post!",
           })
           .set("Authorization", `Bearer ${token}`)
           .set("Content-Type", "application/json")
           .set("Accept", "application/json");

       expect(createCommentResponse3.statusCode).toBe(422);


       const getSubmissionCommentResponse = await request(app)
           .get(`/submissions/${postId}`)
           .set("Accept", "application/json");

       expect(getSubmissionCommentResponse.statusCode).toBe(200);
       expect(getSubmissionCommentResponse.body.comments.length).toBe(1);
       expect(getSubmissionCommentResponse.body.comments[0].content).toBe("This is a great article!");
   });
});
