// Require Sequelize at the top of your file
const Sequelize = require('sequelize');
 
// Set up a new Sequelize instance with your database credentials
const sequelize = new Sequelize('Assignment06', 'web700_DB_owner', 'nbt1VprOHvS5', {
    host: 'ep-curly-bonus-a59510yk.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: true } // Adjust according to your server's SSL configuration
    },
    query: { raw: true }
});
 
// Define your Student and Course models according to the structure in your screenshot
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
}, {
    // Optional Sequelize model settings
    timestamps: false, // Disable timestamps if not needed
    createdAt: false, // Disable if createdAt field is not present
    updatedAt: false, // Disable if updatedAt field is not present
    tableName: 'students' // If your table name is different than the default Sequelize assumes
});
 
const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
}, {
    // Optional Sequelize model settings
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'courses'
});
 
// Define relationships
Course.hasMany(Student, { foreignKey: 'courseId' });
Student.belongsTo(Course, { foreignKey: 'courseId' });
 
module.exports.initialize = function () {
    return sequelize.sync().then(() => {
        // If the sync() operation resolved successfully, we invoke the resolve method
        console.log("Database sync was successful.");
        return Promise.resolve();
    }).catch(err => {
        // If there was an error during sync, we invoke the reject method
        console.log("Database sync failed: " + err);
        return Promise.reject("Unable to sync the database");
    });
};
// Replace each method with its Sequelize equivalent
module.exports.getAllStudents = function () {
    return Student.findAll().then(data => {
        // If the findAll() operation resolved successfully, we invoke the resolve method
        if (data.length > 0) {
            return Promise.resolve(data);
        } else {
            // If no results were found, we still resolve but with an empty array
            return Promise.resolve([]);
        }
    }).catch(err => {
        // If there was an error during findAll, we invoke the reject method
        console.log("Failed to retrieve students: " + err);
        return Promise.reject("No results returned");
    });
};
 
module.exports.getCourses = function () {
    return Course.findAll()
    .then(data => {
        if (data && data.length > 0) {
            return Promise.resolve(data); // Resolve the promise if courses are found
        } else {
            return Promise.reject("No results returned"); // Reject if no courses are found
        }
    })
    .catch(err => {
        console.error("Error retrieving courses: ", err);
        return Promise.reject("No results returned"); // Reject if there's an error in retrieval
    });
};
 
module.exports.getStudentByNum = function (num) {
    return Student.findOne({
        where: { studentNum: num }
    })
    .then(data => {
        if(data) {
            return Promise.resolve(data); // Resolve with the data if the student is found
        } else {
            return Promise.reject("No results returned"); // Reject if the student is not found
        }
    })
    .catch(err => {
        console.error("Error retrieving student by number: ", err);
        return Promise.reject("No results returned"); // Reject if there's an error in retrieval
    });
};
 
module.exports.getCourseById = function (id) {
    return Course.findOne({
        where: { courseId: id }
    })
    .then(data => {
        if (data) {
            return Promise.resolve(data); // Resolve with the data if the course is found
        } else {
            return Promise.reject("No results returned"); // Reject if the course is not found
        }
    })
    .catch(err => {
        console.error("Error retrieving course by ID: ", err);
        return Promise.reject("No results returned"); // Reject if there's an error in retrieval
    });
};
 
// Add student to the database
module.exports.addStudent = function (studentData) {
    // Set the TA property to true or false explicitly
    studentData.TA = (studentData.TA) ? true : false;
 
    // Replace empty string values with null
    for (const property in studentData) {
        if (studentData[property] === "") {
            studentData[property] = null;
        }
    }
 
    return Student.create(studentData)
    .then(() => {
        return Promise.resolve("Student created successfully");
    })
    .catch(err => {
        console.error("Error adding student: ", err);
        return Promise.reject("Unable to create student");
    });
};
 
// Get TAs
module.exports.getTAs = function () {
    return Student.findAll({
        where: { TA: true }
    });
};
 
// Get students by course
module.exports.getStudentsByCourse = function (course) {
    return Student.findAll({
        where: { courseId: course }
    })
    .then(data => {
        if(data) {
            return Promise.resolve(data); // Resolve with the data if students are found
        } else {
            return Promise.reject("No results returned"); // Reject if no students are found
        }
    })
    .catch(err => {
        console.error("Error retrieving students by course: ", err);
        return Promise.reject("No results returned"); // Reject if there's an error in retrieval
    });
};
 
module.exports.updateStudent = function (studentData) {
    // Ensure the TA property is explicitly set to true/false
    studentData.TA = (studentData.TA) ? true : false;
 
    // Replace empty string values with null
    for (const property in studentData) {
        if (studentData[property] === "") {
            studentData[property] = null;
        }
    }
 
    return Student.update(studentData, {
        where: { studentNum: studentData.studentNum }
    })
    .then(() => {
        return Promise.resolve("Student updated successfully");
    })
    .catch(err => {
        console.error("Error updating student: ", err);
        return Promise.reject("Unable to update student");
    });
};
 
module.exports.addCourse = function (courseData) {
    // Replace empty string values with null
    for (const key in courseData) {
        if (courseData.hasOwnProperty(key)) {
            courseData[key] = courseData[key] === "" ? null : courseData[key];
        }
    }
 
    return Course.create(courseData)
    .then(() => {
        return Promise.resolve("Course created successfully");
    })
    .catch(err => {
        console.error("Error adding course: ", err);
        return Promise.reject("Unable to create course");
    });
};
 
// module.exports.updateCourse = function (courseData) {
//     // Replace empty string values with null
//     for (const key in courseData) {
//         if (courseData.hasOwnProperty(key)) {
//             courseData[key] = courseData[key] === "" ? null : courseData[key];
//         }
//     }
 
//     return Course.update(courseData, {
//         where: { courseId: courseData.courseId }
//     })
//     .then(() => {
//         return Promise.resolve("Course updated successfully");
//     })
//     .catch(err => {
//         console.error("Error updating course: ", err);
//         return Promise.reject("Unable to update course");
//     });
// };
 
// collegeData.js
 
module.exports.updateCourse = function(courseData) {
    return new Promise((resolve, reject) => {
        // Use your ORM or database query code here to update the course.
        // This is just an example using Sequelize ORM.
        Course.update({
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription
        }, {
            where: { courseId: courseData.courseId }
        })
        .then(([affectedRows]) => {
            if (affectedRows > 0) {
                resolve();
            } else {
                reject('No rows updated'); // Reject the promise if no rows were updated.
            }
        })
        .catch(err => {
            reject(err); // Reject the promise if there was an error during the query.
        });
    });
};
 
module.exports.deleteCourseById = function (id) {
    return Course.destroy({
        where: { courseId: id }
    })
    .then(deletedRecords => {
        if (deletedRecords > 0) {
            return Promise.resolve("Course deleted successfully");
        } else {
            return Promise.reject("Course not found or already deleted");
        }
    })
    .catch(err => {
        console.error("Error deleting course: ", err);
        return Promise.reject("Unable to delete course");
    });
};
 
 
module.exports.deleteStudentByNum = function (studentNum) {
    return Student.destroy({
        where: { studentNum: studentNum }
    })
    .then(deleted => {
        if (deleted) {
            return Promise.resolve();
        } else {
            return Promise.reject("Student not found or already deleted");
        }
    })
    .catch(err => {
        return Promise.reject(err);
    });
};
