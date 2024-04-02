const { Sequelize, DataTypes } = require('sequelize');

// Replace 'nstdtfya', 'tiXz0MpqMNI0OkUa5nN0qrb5YXfns-xP', 'drona.db.elephantsql.com' with your actual database connection details
const sequelize = new Sequelize('nstdtfya', 'nstdtfya', 'tiXz0MpqMNI0OkUa5nN0qrb5YXfns-xP', {
    host: 'drona.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Student model
const Student = sequelize.define('Student', {
    studentNum: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING
    },
    lastName: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    addressStreet: {
        type: DataTypes.STRING
    },
    addressCity: {
        type: DataTypes.STRING
    },
    addressProvince: {
        type: DataTypes.STRING
    },
    TA: {
        type: DataTypes.BOOLEAN
    },
    status: {
        type: DataTypes.STRING
    }
});

// Define the Course model
const Course = sequelize.define('Course', {
    courseId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: {
        type: DataTypes.STRING
    },
    courseDescription: {
        type: DataTypes.STRING
    }
});

// Define relationships
Course.hasMany(Student, { foreignKey: 'course' });

// Define functions
module.exports.initialize = function () {
    return sequelize.sync()
        .then(() => {
            console.log('Database synced successfully');
        })
        .catch((err) => {
            console.error('Unable to sync the database:', err);
            throw new Error('Unable to sync the database');
        });
}

module.exports.getAllStudents = function () {
    return Student.findAll()
        .then((students) => {
            if (students.length === 0) {
                throw new Error('No results returned');
            }
            return students;
        });
}

module.exports.getStudentsByCourse = function (course) {
    return Student.findAll({ where: { course: course } })
        .then((students) => {
            if (students.length === 0) {
                throw new Error('No results returned');
            }
            return students;
        });
}

module.exports.getStudentByNum = function (num) {
    return Student.findAll({ where: { studentNum: num } })
        .then((students) => {
            if (students.length === 0) {
                throw new Error('No results returned');
            }
            return students[0];
        });
}

module.exports.getCourses = function () {
    return Course.findAll()
        .then((courses) => {
            if (courses.length === 0) {
                throw new Error('No results returned');
            }
            return courses;
        });
}

module.exports.getCourseById = function (id) {
    return Course.findAll({ where: { courseId: id } })
        .then((courses) => {
            if (courses.length === 0) {
                throw new Error('No results returned');
            }
            return courses[0];
        });
}

module.exports.addStudent = function (studentData) {
    studentData.TA = studentData.TA ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === '') {
            studentData[prop] = null;
        }
    }
    
    return Student.create(studentData)
        .then(() => {
            console.log('Student created successfully');
        })
        .catch((err) => {
            console.error('Unable to create student:', err);
            throw new Error('Unable to create student');
        });
}

module.exports.updateStudent = function (studentData) {
    studentData.TA = studentData.TA ? true : false;
    for (let prop in studentData) {
        if (studentData[prop] === '') {
            studentData[prop] = null;
        }
    }

    return Student.update(studentData, {
        where: {
            studentNum: studentData.studentNum
        }
    })
    .then(() => {
        console.log('Student updated successfully');
    })
    .catch((err) => {
        console.error('Unable to update student:', err);
        throw new Error('Unable to update student');
    });
}

module.exports.addCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === '') {
            courseData[prop] = null;
        }
    }
    
    return Course.create(courseData)
        .then(() => {
            console.log('Course created successfully');
        })
        .catch((err) => {
            console.error('Unable to create course:', err);
            throw new Error('Unable to create course');
        });
}

module.exports.updateCourse = function (courseData) {
    for (let prop in courseData) {
        if (courseData[prop] === '') {
            courseData[prop] = null;
        }
    }

    const courseId = courseData.courseId;
    delete courseData.courseId; // Remove courseId from courseData object

    return Course.update(courseData, { where: { courseId: courseId } })
        .then(() => {
            console.log('Course updated successfully');
        })
        .catch((err) => {
            console.error('Unable to update course:', err);
            throw new Error('Unable to update course');
        });
}

module.exports.deleteCourseById = function (id) {
    return Course.destroy({ where: { courseId: id } })
        .then((rowsDeleted) => {
            if (rowsDeleted === 0) {
                throw new Error('No course deleted');
            } else {
                console.log('Course deleted successfully');
            }
        })
        .catch((err) => {
            console.error('Unable to delete course:', err);
            throw new Error('Unable to delete course');
        });
}

// Export the models and functions
module.exports.Student = Student;
module.exports.Course = Course;
