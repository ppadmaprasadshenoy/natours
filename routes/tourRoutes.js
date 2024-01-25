const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourControllers');
const authController = require('./../controllers/authControllers');
const reviewRouter = require('./../routes/reviewRoutes');

// Below param middleware no longer needed because Mongo itself will throw error if id not found
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours,tourController.getAllTours);

    router
    .route('/monthly-plan/:year')
    .get(tourController.aliasTopTours,
         tourController.getMonthlyPlan, 
         authController.protect, 
         authController.restrictTo('admin', 'lead-guide', 'guide'));

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin)

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

router
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, 
         authController.restrictTo('admin', 'lead-guide'),
         tourController.uploadTourImages,
         tourController.resizeTourImages,
         tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

module.exports = router;