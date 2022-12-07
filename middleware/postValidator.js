const { check, validationResult } = require('express-validator')

//validationResult to read all error message
exports.postValidator = [
  check('title').trim().not().isEmpty().withMessage('Post title is required!'),
  check('content').trim().not().isEmpty().withMessage('Content is required!'),
  check('meta')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Meta description required!'),
  check('slug').trim().not().isEmpty().withMessage('Slug content is required!'),
  check('tags')
    .isArray()
    .withMessage('Tags must be array of strings!')
    .custom((tags) => {
      for (let t of tags) {
        if (typeof t !== 'string') {
          throw Error('Tags must be array of strings')
        }
      }
      return true
    }),
]

exports.validate = (req, res, next) => {
  const error = validationResult(req).array()
  if (error.length) {
    return res.status(401).json({ error: error[0].msg })
  }
  next()
}
