const functions = require("firebase-functions");
const app = require("express")();
const firebase = require("firebase");
const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");

const {
    getAllQuestions,
    postOneQuestion,
    getQuestion,
    commentOnQuestion,
    likeQuestion,
    unlikeQuestion,
    deleteQuestion
} = require("./handlers/questions");
const {
    getAllCourses,
    getCourse
} = require("./handlers/courses");
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead,
    joinCourse,
    leaveCourse
} = require("./handlers/users");

// Question routes
// Get all questions
app.get("/questions", getAllQuestions);
// Post one question
app.post("/question", FBAuth, postOneQuestion);
// Get question
app.get("/question/:questionId", getQuestion);
// Delete question
app.delete("/question/:questionId", FBAuth, deleteQuestion);
// Like a question
app.get("/question/:questionId/like", FBAuth, likeQuestion);
// // Unlike a question
app.get("/question/:questionId/unlike", FBAuth, unlikeQuestion);
// Post comment on question
app.post("/question/:questionId/comment", FBAuth, commentOnQuestion);

// Course routes
//  Get all courses 
app.get("/courses", getAllCourses);
// Get one course
app.get("/course/:courseId", getCourse);

// User routes
// Sign up route
app.post("/signup", signup);
// Login route
app.post("/login", login);
// Image upload route
app.post("/user/image", FBAuth, uploadImage);
// Add user details route
app.post("/user", FBAuth, addUserDetails);
// Get this users details route
app.get("/user", FBAuth, getAuthenticatedUser);
// Get user details route
app.get("/user/:handle", getUserDetails);
// Mark notification as read route
app.post("/notifications", FBAuth, markNotificationsRead);
// Join course
app.post("/user/courses/:courseId", FBAuth, joinCourse);
// Leave course
app.delete("/user/courses/:courseId", FBAuth, leaveCourse);


exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
    .document("likes/{id}")
    .onCreate(snapshot => {
        return db
            .doc(`/questions/${snapshot.data().questionId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "like",
                        read: false,
                        questionId: doc.id
                    });
                }
            })
            .catch(err => {
                console.error(err);
            });
    });

exports.deleteNotificationOnUnlike = functions.firestore
    .document("likes/{id}")
    .onDelete(snapshot => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.createNotificationOnComment = functions.firestore
    .document("comments/{id}")
    .onCreate(snapshot => {
        return db
            .doc(`/questions/${snapshot.data().questionId}`)
            .get()
            .then(doc => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "comment",
                        read: false,
                        questionId: doc.id
                    });
                }
            })
            .catch(err => {
                console.error(err);
                return;
            });
    });

exports.onUserImageChange = functions.firestore
    .document("/users/{userId}")
    .onUpdate(change => {
        console.log(change.before.data());
        console.log(change.after.data());
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log("image has changed");
            let batch = db.batch();
            return db
                .collection("questions")
                .where("userHandle", "==", change.before.data().handle)
                .get()
                .then(data => {
                    data.forEach(doc => {
                        const question = db.doc(`/questions/${doc.id}`);
                        batch.update(question, {
                            userImage: change.after.data().imageUrl
                        });
                    });
                    return batch.commit();
                });
        } else return true;
    });

exports.onQuestionDelete = functions
    .region("europe-west1")
    .firestore.document("/questions/{questionId}")
    .onDelete((snapshot, context) => {
        const questionId = context.params.questionId;
        const batch = db.batch();
        return db
            .collection("comments")
            .where("questionId", "==", questionId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db
                    .collection("likes")
                    .where("questionId", "==", questionId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db
                    .collection("notifications")
                    .where("questionId", "==", questionId)
                    .get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch(err => console.error(err));
    });
