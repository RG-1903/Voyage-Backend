const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// --- THIS IS THE FIX ---
// We are pointing to the correct file "Request.js"
const ClientRequest = require('../models/Request'); 
// ----------------------
const Client = require('../models/Client'); 
const Package = require('../models/Package'); 
const sendEmail = require('../utils/sendEmail'); 

// @route   POST api/requests/add
// @desc    Add a new client request (booking)
// @access  Private (User)
router.post('/add', auth, async (req, res) => {
    try {
        const { packageId, fullName, email, phone, travelDate, travelers, message } = req.body;

        const newRequest = new ClientRequest({
            user: req.user.id,
            package: packageId,
            fullName,
            email,
            phone,
            travelDate,
            travelers,
            message
        });

        const savedRequest = await newRequest.save();

        // --- Send Booking Invoice Email ---
        try {
            const user = await Client.findById(req.user.id);
            const pkg = await Package.findById(packageId);

            if (user && pkg) {
                const html = `
                    <h1>Booking Confirmation</h1>
                    <p>Hi ${user.name},</p>
                    <p>Thank you for booking with Voyage! We have received your request and will contact you shortly to finalize the details.</p>
                    <hr>
                    <h3>Booking Summary:</h3>
                    <p><strong>Package:</strong> ${pkg.title}</p>
                    <p><strong>Location:</strong> ${pkg.location}</p>
                    <p><strong>Price:</strong> $${pkg.price} (approx)</p>
                    <p><strong>Travel Date:</strong> ${new Date(travelDate).toLocaleDateString()}</p>
                    <p><strong>Travelers:</strong> ${travelers}</p>
                    <hr>
                    <p>Your request ID is: ${savedRequest._id}</p>
                    <p>Best regards,<br>The Voyage Team</p>
                `;
                await sendEmail(user.email, `Your Voyage Booking Confirmation (${pkg.title})`, html);
                console.log(`Booking invoice sent to ${user.email}`);
            }
        } catch (emailError) {
            console.error("Failed to send booking email:", emailError);
        }
        // --- End of Email Logic ---

        res.json(savedRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/requests
// @desc    Get all client requests
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
    try {
        const requests = await ClientRequest.find().populate('package', ['title', 'location']).populate('user', ['name', 'email']).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/requests/:id
// @desc    Delete a request
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        await ClientRequest.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Request removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;