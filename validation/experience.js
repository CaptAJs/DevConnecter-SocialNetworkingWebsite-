const validator = require("validator");

const isEmpty = require("./is_empty");
module.exports = function validationExperienceInput(data) {
  let errors = {};
  data.title = !isEmpty(data.title) ? data.title : "";
  data.company = !isEmpty(data.company) ? data.company : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (validator.isEmpty(data.title)) {
    errors.title = "Title is required";
  }
  if (validator.isEmpty(data.company)) {
    errors.company = "Company is required";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "From Date is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
