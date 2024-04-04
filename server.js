/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Samuel Adekola Student ID: 130895220 Date: 2024 - 03 - 24
*
********************************************************************************/ 

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
            // Check if used as a block helper
            if (options.fn) {
                if (lvalue === rvalue) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            }
            // Fallback for inline usage
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

    // Students route
    app.get('/students', (req, res) => {
        collegeData.getAllStudents()
        .then((data) => {
            if (data.length > 0) {
                res.render('students', { students: data });
            } else {
                res.render('students', { message: "no results" });
            }
        })
        .catch((err) => {
            res.render('students', { message: "unable to fetch students" });
        });
    });
    // Courses route
    app.get('/courses', (req, res) => {
        collegeData.getCourses()
        .then((data) => {
            if (data.length > 0) {
                res.render('courses', { courses: data });
            } else {
                res.render('courses', { message: "no results" });
            }
        })
        .catch((err) => {
            res.render('courses', { message: "unable to fetch courses" });
        });
    });
    

    // app.get('/student/:num', (req, res) => {
    //     Promise.all([
    //         collegeData.getStudentByNum(req.params.num),
    //         collegeData.getCourses()
    //     ])
    //     .then(([studentData, coursesData]) => {
    //         res.render('student', {
    //             student: studentData,
    //             courses: coursesData // Ensure this is an array of course objects
    //         });
    //     })
    //     .catch(err => {
    //         // Handle errors, such as sending a 500 status code
    //         console.error(err);
    //         res.status(500).send('Error loading student edit form');
    //     });
    // });
    app.get('/student/:studentNum', (req, res) => {
        let viewData = {};
    
        collegeData.getStudentByNum(req.params.studentNum).then((data) => {
            if (data) {
                viewData.student = data; // store student data in the "viewData" object as "student"
            } else {
                viewData.student = null; // set student to null if none were returned
            }
        }).catch(() => {
            viewData.student = null; // set student to null if there was an error
        }).then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data; // store course data in the "viewData" object as "courses"
            
            // loop through viewData.courses and once we have found the courseId that matches 
            // the student's "course" value, add a "selected" property to the matching 
            // viewData.courses object
            for (let i = 0; i < viewData.courses.length; i++) {
                if (viewData.courses[i].courseId === viewData.student.course) {
                    viewData.courses[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.courses = []; // set courses to empty if there was an error
        }).then(() => {
            if (!viewData.student) { // if no student - return an error
                res.status(404).send("Student Not Found");
            } else {
                res.render("student", { viewData: viewData }); // render the "student" view
            }
        });
    });
    
    
    // Course by ID route
    // app.get("/course/:id", (req, res) => {
    //     const courseId = req.params.id;
    //     collegeData.getCourseById(courseId)
    //         .then((course) => {
    //             if (course) {
    //                 res.render("course", { course: course });
    //             } else {
    //                 res.status(404).render("error", { message: "Course not found" });
    //             }
    //         })
    //         .catch((err) => res.status(500).render("error", { message: "Internal server error" }));
    // });


    app.post('/student/update', (req, res) => {
        //console.log(req.body); // Add this line to debug incoming form data
        collegeData.updateStudent(req.body)
            .then(() => {
                res.redirect('/students');
            })
            .catch(err => {
                console.error(err);
                res.status(500).send("Unable to update student.");
            });
    });
    
    


    // About route
    app.get("/about", (req, res) => {
        res.render('about', { navLink: app.locals.activeRoute });
    });

    // HTML demo route
    app.get("/htmlDemo", (req, res) => {
        res.render('htmlDemo', { navLink: app.locals.activeRoute });
    });

    // Add student form route
    // app.get("/students/add", (req, res) => {
    //     collegeData.getCourses()
    //     .then((courses) => {
    //         res.render("addStudent", { courses: courses });
    //     })
    //     .catch(() => {
    //         // If there's an error such as not being able to retrieve courses, 
    //         // you can still render the view but without the courses list.
    //         res.render("addStudent", { courses: [] });
    //     });
    // });
    app.get("/students/add", (req, res) => {
        collegeData.getCourses()
        .then(courses => {
            res.render("addStudent", { courses: courses });
        })
        .catch(error => {
            // Handle error, possibly still render the page with an empty courses array
            res.render("addStudent", { courses: [] });
        });
    });
    
    // Add student form submission route
    app.post("/students/add", (req, res) => {
        collegeData.addStudent(req.body)
            .then(() => res.redirect("/students"))
            .catch((err) => {
                console.error("Failed to add student:", err);
                res.status(500).send("Failed to add student");
            });
    });

    // Update student form route
    app.get("/students/update/:studentNum", (req, res) => {
        const studentNum = req.params.studentNum;
        collegeData.getStudentByNum(studentNum)
            .then((student) => res.render("updateStudent", { student: student }))
            .catch(() => res.status(404).render("error", { message: "Student not found" }));
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
                console.error("Failed to update student:", err);
                res.status(500).send("Failed to update student");
            });
    });

    // Route to display the form for adding a new course
app.get('/courses/add', (req, res) => {
    res.render('addCourse'); // Make sure you have an 'addCourse' view in your views directory
});

// Route to handle the POST from the 'addCourse' form
app.post('/courses/add', (req, res) => {
    collegeData.addCourse(req.body)
    .then(() => {
        res.redirect('/courses');
    })
    .catch(err => {
        res.status(500).send("Unable to add course: " + err);
    });
});

// Route to display the form for updating a course
app.get('/courses/update/:id', (req, res) => {
    collegeData.getCourseById(req.params.id)
    .then((courseData) => {
        if (courseData) {
            res.render('updateCourse', { course: courseData }); // Make sure you have an 'updateCourse' view in your views directory
        } else {
            res.status(404).send("Course Not Found");
        }
    })
    .catch(err => {
        res.status(500).send("Unable to fetch course: " + err);
    });
});

// Route to handle the POST from the 'updateCourse' form
app.post('/courses/update', (req, res) => {
    collegeData.updateCourse(req.body)
    .then(() => {
        res.redirect('/courses');
    })
    .catch(err => {
        res.status(500).send("Unable to update course: " + err);
    });
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
    .then((course) => {
        if (course) {
            res.render("course", { course: course });
        } else {
            res.status(404).send("Course Not Found");
        }
    })
    .catch((err) => {
        res.status(500).send("Error fetching course: " + err);
    });
});

app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
    .then(() => {
        res.redirect("/courses");
    })
    .catch(err => {
        // Handle errors here. For example, you might want to render an error page or redirect with an error message.
        res.status(500).send("Unable to remove course / Course not found");
    });
});

app.get('/student/delete/:studentNum', (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
    .then(() => {
        res.redirect('/students');
    })
    .catch(err => {
        res.status(500).send("Unable to remove student / Student not found");
    });
});




    // 404 error handling
    app.use((req, res) => {
        res.status(404).render("error", { message: "Page not found" });
    });

    // Start the server
    app.listen(HTTP_PORT, () => {
        console.log("Server listening on port: " + HTTP_PORT);
    });

}).catch(err => {
    console.error("Failed to initialize data:", err);
});
