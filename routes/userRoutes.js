const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authControllers');

// router.param('id', (req, res, next, val) => {
//     console.log(`ID is ${val}`);
//     next();
// });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes from this middleware
router.use(authController.protect);

// Anyone who has logged in can perform the below methods
router.patch('/updateMyPassword', authController.changePassword);

router.get('/me', userController.getMe, userController.getUser)
            
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


router.use(authController.restrictTo('admin'));

// Only admin can perform the below methods
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;