const { db } = require("../util/admin");

// CHANGED
exports.getAllQuestions = (req, res) => {
    db.collection("questions")
        .orderBy("createdAt", "desc")
        .get()
        .then(data => {
            let questions = [];
            data.forEach(doc => {
                questions.push({
                    questionId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
                });
            });
            return res.json(questions);
        })
        .catch(err => console.error(err));
};

// CHANGED
exports.postOneQuestion = (req, res) => {
    if (req.body.body.trim() === "") {
        return res.status(400).json({ body: "Body must not be empty" });
    }

    const newQuestion = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db.collection("questions")
        .add(newQuestion)
        .then(doc => {
            const resQuestion = newQuestion;
            resQuestion.questionId = doc.id;
            res.json(resQuestion);
        })
        .catch(err => {
            res.status(500).json({ error: "something went wrong" });
            console.error(err);
        });
};

// CHANGED
exports.getQuestion = (req, res) => {
    let questionData = {};
    db.doc(`/questions/${req.params.questionId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Question not found" });
            }
            questionData = doc.data();
            questionData.questionId = doc.id;
            return db
                .collection("comments")
                .orderBy("createdAt", "desc")
                .where("questionId", "==", req.params.questionId)
                .get();
        })
        .then(data => {
            questionData.comments = [];
            data.forEach(doc => {
                questionData.comments.push(doc.data());
            });
            return res.json(questionData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Comment on question
exports.commentOnQuestion = (req, res) => {
    if (req.body.body.trim() === "")
        return res.status(400).json({ comment: "Must not be empty" });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        questionId: req.params.questionId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/questions/${req.params.questionId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Question not found" });
            }
            return doc.ref.update({ commentCount: doc.data().commentCount + 1});
        })
        .then(() => {
            return db.collection("comments").add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

// Like a question
exports.likeQuestion = (req, res) => {
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("questionId", "==", req.params.questionId)
        .limit(1);

    const questionDocument = db.doc(`/questions/${req.params.questionId}`);

    let questionData;

    questionDocument
        .get()
        .then(doc => {
            if (doc.exists) {
                questionData = doc.data();
                questionData.questionId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Question not found" });
            }
        })
        .then(data => {
            if (data.empty) {
                return db
                    .collection("likes")
                    .add({
                        questionId: req.params.questionId,
                        userHandle: req.user.handle
                    })
                    .then(() => {
                        questionData.likeCount++;
                        return questionDocument.update({
                            likeCount: questionData.likeCount
                        });
                    })
                    .then(() => {
                        return res.json(questionData);
                    });
            } else {
                return res.status(400).json({ error: "Question already liked" });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Unlike a question
exports.unlikeQuestion = (req, res) => {
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("questionId", "==", req.params.questionId)
        .limit(1);

    const questionDocument = db.doc(`/questions/${req.params.questionId}`);

    let questionData;

    questionDocument
        .get()
        .then(doc => {
            if (doc.exists) {
                questionData = doc.data();
                questionData.questionId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Question not found" });
            }
        })
        .then(data => {
            if (data.empty) {
                return res.status(400).json({ error: "Question not liked" });
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        questionData.likeCount--;
                        return questionDocument.update({ likeCount: questionData.likeCount });
                    })
                    .then(() => {
                        res.json(questionData);
                    })
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Delete a question
exports.deleteQuestion = (req, res) => {
    const document = db.doc(`/questions/${req.params.questionId}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(404).json({ error: 'Question not found' })
            }
            if(doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: 'Unauthorized' });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: 'Question deleted successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
};