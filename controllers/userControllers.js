const User = require('./../model/userModel');
const catchAsync =  require('./../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('./../utils/appErrors');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startWith('image')){
        cb(null, true);
    }else {
        cb(new AppError('Not an image. Please upload an image!', 400), false);
    }
};

const upload = multer({ 
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
                .resize(500,500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/${req.file.filename}`);
    
    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) 
            newObj[el] = obj[el];
    });
return newObj;
};

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync( async(req, res, next) => {
    // 1) Create error if user updates password
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for update password. Use /updateMyPassword', 400));
    }

    // 2) Filtered out field names that are not allowed to be updated
    const filterBody = filterObj(req.body, 'name', 'email');        // This way u are making sure he doesnt have access to edit other fields like role.
    if(req.file) filterBody.photo = req.file.filename;


    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id , filterBody, { 
        new: true,
        runvalidators: true
    });

    res.status(200).json({
        status: 'Success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false});

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res)=>{
    res.status(500).json({
        status: 'Error',
        message: 'This route is not yet defined. Please use signup instead.'
    });
}

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

// Do not update passwords this
exports.updateUser = factory.updateOne(User);           // Permission only for admin

exports.deleteUser = factory.deleteOne(User);