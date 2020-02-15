let db = {
    users: [
        {
            userId: "dh23ggj5h32g543j5gf43",
            email: "user@email.com",
            handle: "user",
            createdAt: "2019-03-15T10:59:52.798Z",
            imageUrl: "image/dsfsdkfghskdfgs/dgfdhfgdh",
            bio: "Hello, my name is user, nice to meet you",
            website: "https://user.com",
            location: "Lonodn, UK"
        }
    ],
    questions: [
        {
            userHandle: "user",
            body: "This is a sample question",
            createdAt: "2019-03-15T10:59:52.798Z",
            likeCount: 5,
            commentCount: 3
        }
    ],
    courses: [
        {
            courseId: "asddsfgs34awdf",
            courseName: "Biology I",
            subject: "BIO",
            courseNumber: "1134",
            sectionNumber: "02",
            instructor: "So and So"
        }
    ],
    comments: [
        {
            userHandle: "user",
            questionId: "kdjsfgdksuufhgkdsufky",
            body: "nice one mate!",
            createdAt: "2019-03-15T10:59:52.798Z"
        }
    ],
    notifications: [
        {
            recipient: "user",
            sender: "john",
            read: "true | false",
            questionId: "kdjsfgdksuufhgkdsufky",
            type: "like | comment",
            createdAt: "2019-03-15T10:59:52.798Z"
        }
    ]
};
const userDetails = {
    // Redux data
    credentials: {
        userId: "N43KJ5H43KJHREW4J5H3JWMERHB",
        email: "user@email.com",
        handle: "user",
        createdAt: "2019-03-15T10:59:52.798Z",
        imageUrl: "image/dsfsdkfghskdfgs/dgfdhfgdh",
        bio: "Hello, my name is user, nice to meet you",
        website: "https://user.com",
        location: "Lonodn, UK"
    },
    likes: [
        {
            userHandle: "user",
            questionId: "hh7O5oWfWucVzGbHH2pa"
        },
        {
            userHandle: "user",
            questionId: "3IOnFoQexRcofs5OhBXO"
        }
    ]
};
