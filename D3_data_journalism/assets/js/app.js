// declare the census data
var censusData = [];

//
// Initialize the application by reading the data and then
// call the callback to initialize the graphs
//
function initApp(callback) {
  d3.csv("assets/data/data.csv")
    .then(
      (data) => {
        // Format the date and cast the force value to a number
        data.forEach((element) => {
          element.age = +element.age;
          element.smokes = +element.smokes;
          element.healthcare = +element.healthcare;
          element.poverty = +element.poverty;
        });

        censusData = data;
      },
      function (error) {
        console.log(error);
      }
    )
    .then(callback);
}

//
// initialize the scatter plot
//
function init() {
  console.log("init()");
  console.log(censusData);
}

initApp(init);
