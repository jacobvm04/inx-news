import express from "express";
import passport from "passport";
import Joi from "joi";
const router = express.Router();

router.get("/", async (req, res, next) => {
    const db = req.app.get("db");

    try {
        const submissions = await db
            .select()
            .from("submissions")
            .orderBy("votes", "desc")
            .limit(10);

        res.json({ submissions });
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    const db = req.app.get("db");
    const submissionId = req.params.id;

    try {
        const submission = await db
            .first()
            .from("submissions")
            .where("id", submissionId);

        const comments = await db
            .select()
            .from("comments")
            .where("post", submissionId);

        res.json({ submission, comments });
    } catch (error) {
        next(error);
    }
});

router.post("/:id", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const db = req.app.get("db");
    const postId = req.params.id;

    const reqSchema = Joi.object({
        content: Joi.string()
            .min(3)
            .max(1000)
            .required(),
        post: Joi.number()
            .integer()
            .required(),
        author: Joi.string()
            .required(),
    });

    const reqValidation = reqSchema.validate({
        content: req.body.content,
        post: postId,
        author: req.user.username,
    });

    if (reqValidation.error)
        return res.status(422).json({ messages: reqValidation.error.details.map(err => err.message)} );

    const reqData = reqValidation.value;

    try {
        const submissionQuery = await db("submissions")
            .select()
            .where("id", postId);

        if (submissionQuery.length < 1)
            return res.status(422).json( { message: "That submission does not exist" } );

        const id = await db("comments")
            .insert(reqData)
            .returning("id");

        res.status(201).json({
            message: "Comment submitted successfully",
            comment: {
                ...reqData,
                id: id[0],
            },
        })
    } catch (error) {
        next(error);
    }
});

router.post("/", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
    const db = req.app.get("db");

    const reqSchema = Joi.object({
       title: Joi.string()
           .min(3)
           .max(100)
           .required(),
        link: Joi.string()
            .uri()
            .required(),
        author: Joi.string()
            .required(),
    });

    const reqValidation = reqSchema.validate({
        title: req.body.title,
        link: req.body.link,
        author: req.user.username,
    });

    if (reqValidation.error)
        return res.status(422).json({ messages: reqValidation.error.details.map(err => err.message)} );

    const reqData = reqValidation.value;

    try {
        const id = await db("submissions")
            .insert(reqData)
            .returning("id");

        res.status(201).json({
            message: "Submission submitted successfully",
            submission: {
                ...reqData,
                id: id[0],
            },
        })
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', async (req, res, next) => {
    const db = req.app.get("db");
    const submissionId = req.params.id;

    try {
        await db
            .from("submissions")
            .where("id", submissionId)
            .update("votes", db.raw("votes + 1"));

        res.json({
           message: "Submission upvoted successfully",
        });

    } catch(error) {
        next(error);
    }
});

export default router;

