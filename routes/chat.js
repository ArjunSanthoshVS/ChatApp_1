const express = require('express');
const chatController = require('../controllers/chatController');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const cloudinary = require('../utils/cloudinary')
const streamifier = require('streamifier');


router.get('/new', chatController.newUser);
router.get('/roomDetails', chatController.roomDetails);
router.get('/specificRoomOfUser', chatController.specificRoomOfUser);
router.get('/specificRoomOfAdmin', chatController.specificRoomOfAdmin);
router.get('/allContacts', chatController.allContacts)
router.get('/getAllMessage', chatController.getAllMessage)
router.post('/addMessage', chatController.addMessage)
router.get('/destroyChat', chatController.destroyChat)
router.get('/updateEnteredUsers', chatController.updateEnteredUsers)
router.get('/secondUser', chatController.secondUser)
// router.get('/retrieveIp', chatController.retrieveIp)


router.post('/uploadPDF', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded!' });
        }

        // Upload the PDF file to Cloudinary using the file buffer
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                    if (error) {
                        console.error('Error uploading to Cloudinary:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        // Once uploaded, you can obtain the public URL of the PDF
        const pdfURL = result.secure_url;
        const filename = req.file.originalname;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).json({ pdfURL: pdfURL, filename: filename });
    } catch (error) {
        console.error('Error handling PDF file:', error);
        res.status(500).json({ message: "Can't Upload PDF to Cloudinary" });
    }
});

router.post('/uploadImage', upload.array('imageFile'), async (req, res) => {
    console.log(req.files);
    try {
        const files = req.files; 
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded!' });
        }

        const uploadedFiles = [];

        for (const file of files) {
            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: "image" }, 
                    (error, result) => {
                        if (error) {
                            console.error('Error uploading to Cloudinary:', error);
                            reject(error);
                        } else {
                            const imageUrl = result.secure_url; // URL of the uploaded image
                            const filename = file.originalname; // Name of the uploaded image
                            uploadedFiles.push({ imageUrl, filename });
                            resolve(); // Resolve the promise once the upload is complete
                        }
                    }
                ).end(file.buffer); // Upload the file buffer
            });

            await uploadPromise; // Wait for this file upload to complete before moving to the next file
        }

        // After all files are uploaded, send the response
        res.status(200).json({ uploadedFiles });
    } catch (error) {
        console.error('Error handling image upload:', error);
        res.status(500).json({ message: "Can't Upload Images to Cloudinary" });
    }
});

router.post('/uploadVideo', upload.array('videoFile'), async (req, res) => {
    try {
        const files = req.files; 
        
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded!' });
        }

        const uploadedFiles = [];

        for (const file of files) {
            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: "video" }, 
                    (error, result) => {
                        if (error) {
                            console.error('Error uploading to Cloudinary:', error);
                            reject(error);
                        } else {
                            const videoUrl = result.secure_url; // URL of the uploaded image
                            const filename = file.originalname; // Name of the uploaded image
                            uploadedFiles.push({ videoUrl, filename });
                            resolve(); // Resolve the promise once the upload is complete
                        }
                    }
                ).end(file.buffer); // Upload the file buffer
            });

            await uploadPromise; // Wait for this file upload to complete before moving to the next file
        }

        // After all files are uploaded, send the response
        res.status(200).json({ uploadedFiles });
    } catch (error) {
        console.error('Error handling image upload:', error);
        res.status(500).json({ message: "Can't Upload Images to Cloudinary" });
    }
});

router.post('/captureUploadImage', upload.single('capturedImage'), async (req, res) => {
    try {
        const file = req.file; // 'capturedImage' should match the name attribute of the input field

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded!' });
        }

        // Upload the file to Cloudinary
        cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) {
                console.error('Error uploading to Cloudinary:', error);
                res.status(400).json({ message: 'Failed to upload to Cloudinary' });
            } else {
                const imageUrl = result.secure_url; // URL of the uploaded image
                const filename = file.originalname; // Name of the uploaded image

                // Handle success, send response with imageUrl and filename
                res.status(200).json({ imageUrl, filename });
            }
        }).end(file.buffer); // Upload the file buffer to Cloudinary
    } catch (error) {
        console.error('Error handling image upload:', error);
        res.status(500).json({ message: "Can't Upload Images to Cloudinary" });
    }
});

module.exports = router;