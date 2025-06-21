const Joi = require("joi")

const authValidation = {
    register: Joi.object({
        name: Joi.string().required().trim(),
        email: Joi.string().email().required().trim().lowercase(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid("guest", "host", "admin").default("guest"),
    }),

    login: Joi.object({
        email: Joi.string().email().required().trim().lowercase().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
    }),

    verifyOTP: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        otp: Joi.string().length(6).required(),
    }),

    resetPassword: Joi.object({
        email: Joi.string().email().required().trim().lowercase(),
        otp: Joi.string().length(6).required(),
        password: Joi.string().min(6).required(),
    }),

    resendOTP: Joi.object({
        email: Joi.string().email().required().trim().lowercase().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        })
    })
}

module.exports = { authValidation } 