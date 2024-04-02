const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const bodyParser = require("body-parser");
const collegeData = require("./modules/collegeData.js");

const HTTP_PORT = process.env.PORT || 8080;
const app = express();

const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts/'),
    helpers: {
        navLink: function(url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active"' : ' class="nav-item"') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (options.fn) {
                return lvalue === rvalue ? options.fn(this) : options.inverse(this);
            }
            return lvalue === rvalue;
        }
    }
});

// Set up handlebars engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for setting active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Initialize college data
collegeData.initialize().then(() => {
    console.log("Data initialized. Setting up the routes.");

    // Static files middleware
    app.use(express.static(path.join(__dirname, 'public')));

    // Home route
    app.get("/", (req, res) => {
        res.render('home', { navLink: app.locals.activeRoute });
    });

    // About route
    app.get("/about", (req, res) => {
        res.render('about', { navLink: app.locals.activeRoute });
    });

    // HTML Demo route
    app.get("/htmlDemo", (req, res) => {
        res.render('htmlDemo', { navLink: app.locals.activeRoute });
    });

    // Students route
    app.get("/students", (req, res) => {
        collegeData.getAllStudents()
            .then((students) => {
                if (students.length > 0) {
                    res.render("students", { students: students });
                } else {
                    res.render("students", { message: "No students found" });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Internal server error");
            });
    });

    // Courses route
    app.get("/courses", (req, res) => {
        collegeData.getCourses()
            .then((courses) => {
                if (courses.length > 0) {
                    res.render("courses", { courses: courses });
                } else {
                    res.render("courses", { message: "No courses found" });
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("Internal server error");
            });
    });

    // Add student form route
    app.get("/students/add", (req, res) => {
        collegeData.getCourses()
            .then((courses) => {
                res.render('addStudent', { navLink: app.locals.activeRoute, courses: courses });
            })
            .catch(() => {
                res.render("addStudent", { navLink: app.locals.activeRoute, courses: [] });
            });
    });

    // Add student form submission route
    app.post("/students/add", (req, res) => {
        collegeData.addStudent(req.body)
            .then(() => res.redirect("/students"))
            .catch((err) => {
                console.error(err);
                res.status(500).send("Failed to add student");
            });
    });

    // Update student form route
    app.get("/students/update/:studentNum", (req, res) => {
        const studentNum = req.params.studentNum;
        collegeData.getStudentByNum(studentNum)
            .then((student) => res.render("updateStudent", { student: student }))
            .catch(() => res.status(404).send("Student not found"));
    });

    // Update student form submission route
    app.post("/students/update/:studentNum", (req, res) => {
        const studentNum = req.params.studentNum;
        const updatedStudent = req.body;

        // Check if the updatedStudent object contains valid data
        if (!updatedStudent.studentNum) {
            res.status(400).send("Invalid student data");
            return;
        }

        collegeData.updateStudent(updatedStudent)
            .then(() => res.redirect("/students"))
            .catch((err) => {
                console.error(err);
                res.status(500).send("Failed to update student");
            });
    });

    // Add course form route
    app.get("/courses/add", (req, res) => {
        res.render('addCourse', { navLink: app.locals.activeRoute });
    });

    // Add course form submission route
    app.post("/courses/add", (req, res) => {
        collegeData.addCourse(req.body)
            .then(() => res.redirect("/courses"))
            .catch((err) => {
                console.error(err);
                res.status(500).send("Failed to add course");
            });
    });

    // Update course form route
    app.get("/courses/update/:courseId", (req, res) => {
        const courseId = req.params.courseId;
        collegeData.getCourseById(courseId)
            .then((course) => res.render("updateCourse", { course: course }))
            .catch(() => res.status(404).send("Course not found"));
    });

    // Update course form submission route
    app.post("/courses/update/:courseId", (req, res) => {
        const courseId = req.params.courseId;
        const updatedCourse = req.body;

        // Check if the updatedCourse object contains valid data
        if (!updatedCourse.courseId) {
            res.status(400).send("Invalid course data");
            return;
        }

        collegeData.updateCourse(updatedCourse)
            .then(() => res.redirect(`/courses/course/${courseId}`))
            .catch((err) => {
                console.error(err);
                res.status(500).send("Failed to update course");
            });
    });

    // Delete course route
    app.get("/courses/delete/:courseId", (req, res) => {
        const courseId = req.params.courseId;
        collegeData.deleteCourseById(courseId)
            .then(() => res.redirect("/courses"))
            .catch(() => res.status(500).send("Unable to remove course / Course not found"));
    });

    // 404 error handling
    app.use((req, res) => {
        res.status(404).send("Page not found");
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });

}).catch(err => {
    console.error("Failed to initialize data:", err);
    process.exit(1); // Exit the process if data initialization fails
});
