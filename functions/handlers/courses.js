const { db } = require("../util/admin");

exports.getAllCourses = (req, res) => {
    db.collection("courses")
        .orderBy("courseName", "desc")
        .get()
        .then(data => {
            let courses = [];
            data.forEach(doc => {
                courses.push({
                    courseId: doc.id,
                    courseName: doc.data().courseName,
                    subject: doc.data().subject,
                    courseNumber: doc.data().courseNumber,
                    sectionNumber: doc.data().sectionNumber,
                    instructor: doc.data().instructor,
                });
            });
            return res.json(courses);
        })
        .catch(err => console.error(err));
};

// Get one course
exports.getCourse = (req, res) => {
    let courseData = {};
    db.doc(`/courses/${req.params.courseId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Course not found" });
            }
            courseData = doc.data();
            return res.json(courseData);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};