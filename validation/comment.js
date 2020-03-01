const validator = require("validator");

const isEmpty = require("./is_empty");
module.exports = function validationCommentInput(data) {
  let errors = {};
  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post must be between 10 to 300";
  }
  if (validator.isEmpty(data.text)) {
    errors.text = "Text Field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
