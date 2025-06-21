const { validationResult } = require("express-validator")

const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body, { abortEarly: false });
        next();
    } catch (error) {
        const errors = error.inner.map((err) => ({
            field: err.path,
            message: err.message,
        }));

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors,
        });
    }
};

module.exports = validateRequest; 