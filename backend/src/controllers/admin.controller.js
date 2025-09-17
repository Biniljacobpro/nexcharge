import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { sendCorporateAdminWelcomeEmail } from '../utils/emailService.js';
import Corporate from '../models/corporate.model.js';

export const overview = async (_req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const rolesAgg = await User.aggregate([
			{ $group: { _id: '$role', count: { $sum: 1 } } }
		]);
		return res.json({ totalUsers, byRole: rolesAgg });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to load overview' });
	}
};

export const listUsers = async (_req, res) => {
	try {
		const users = await User.find({}, { 'personalInfo.firstName': 1, 'personalInfo.lastName': 1, 'personalInfo.email': 1, role: 1, createdAt: 1 }).limit(200).sort({ createdAt: -1 });
		return res.json({ users });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to load users' });
	}
};

// List corporate admins with active status
export const listCorporateAdmins = async (_req, res) => {
	try {
		const admins = await User.find(
			{ role: 'corporate_admin' },
			{
				'personalInfo.firstName': 1,
				'personalInfo.lastName': 1,
				'personalInfo.email': 1,
				'personalInfo.phone': 1,
				'personalInfo.address': 1,
				'credentials.isActive': 1,
				'roleSpecificData.corporateAdminInfo': 1,
				createdAt: 1
			}
		)
		.populate('roleSpecificData.corporateAdminInfo.corporateId', 'name businessRegistrationNumber contactEmail contactPhone status')
		.sort({ createdAt: -1 });
		return res.json({ admins });
	} catch (e) {
		return res.status(500).json({ error: 'Failed to load corporate admins' });
	}
};

export const addCorporateAdmin = async (req, res) => {
	try {
		console.log('Adding corporate admin with data:', req.body);
		
		let {
			companyName,
			companyEmail,
			firstName,
			lastName,
			contactNumber,
			businessRegistrationNumber
		} = req.body;

		// Normalize inputs
		companyName = (companyName || '').trim();
		companyEmail = (companyEmail || '').trim();
		firstName = (firstName || '').trim();
		lastName = (lastName || '').trim();
		contactNumber = (contactNumber || '').trim();
		businessRegistrationNumber = (businessRegistrationNumber || '').trim();

		// Validate required fields
		if (!companyName || !companyEmail || !firstName || !lastName || !contactNumber) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: companyName, companyEmail, firstName, lastName, contactNumber'
			});
		}

		// Server-side validation rules
		if (companyName.length > 20) {
			return res.status(400).json({ success: false, message: 'Company name must be 20 characters or fewer' });
		}

		// Email: allow subdomains, require TLD >= 2 letters
		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
		if (!emailRegex.test(companyEmail)) {
			return res.status(400).json({ success: false, message: 'Invalid company email format' });
		}

		const phoneDigitsOnly = String(contactNumber).replace(/\D/g, '');
		if (phoneDigitsOnly.length !== 10) {
			return res.status(400).json({ success: false, message: 'Contact number must be exactly 10 digits' });
		}

		// Contact person first/last name: letters and spaces only
		const nameRegex = /^[A-Za-z ]+$/;
		if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
			return res.status(400).json({ success: false, message: 'First and Last name must contain only letters and spaces' });
		}

		// BRN: exactly 21 alphanumeric characters, unique
		const brn = businessRegistrationNumber;
		if (!/^[A-Za-z0-9]{21}$/.test(brn)) {
			return res.status(400).json({ success: false, message: 'Business Registration Number must be a 21-character alphanumeric code' });
		}

		// Uniqueness checks
		// Email must be unique
		const existingUserByEmail = await User.findOne({ 'personalInfo.email': companyEmail });
		if (existingUserByEmail) {
			return res.status(400).json({ success: false, message: 'A user with this email already exists' });
		}

		// Phone must be unique
		const existingUserByPhone = await User.findOne({ 'personalInfo.phone': phoneDigitsOnly });
		if (existingUserByPhone) {
			return res.status(400).json({ success: false, message: 'A user with this contact number already exists' });
		}

		// Company name must be unique among corporates
		const existingCorpByName = await Corporate.findOne({ name: new RegExp(`^${companyName}$`, 'i') });
		if (existingCorpByName) {
			return res.status(400).json({ success: false, message: 'A corporate with this name already exists' });
		}

		// Generate a secure temporary password
		const tempPassword = generateSecurePassword();
		console.log('Generated temp password for:', companyEmail);
		
		const hashedPassword = await bcryptjs.hash(tempPassword, 12);

		// Create the corporate entity first
		const corporate = await Corporate.create({
			name: companyName,
			businessRegistrationNumber: brn,
			contactEmail: companyEmail,
			contactPhone: phoneDigitsOnly,
			admins: []
		});

		// Create the corporate admin user
		const user = new User({
			personalInfo: {
				firstName: firstName || 'Corporate',
				lastName: lastName || 'Admin',
				email: companyEmail,
				phone: phoneDigitsOnly,
				address: ''
			},
			credentials: {
				passwordHash: hashedPassword,
				lastLogin: new Date(),
				isActive: true,
				twoFactorEnabled: false,
				mustChangePassword: true
			},
			role: 'corporate_admin',
			roleSpecificData: {
				corporateAdminInfo: {
					corporateId: corporate._id,
					accessLevel: 'full',
					managedFranchises: []
				}
			}
		});

		console.log('Saving user to database...');
		await user.save();
		corporate.admins.push(user._id);
		await corporate.save();
		console.log('User saved successfully:', user._id);

		// Send welcome email with temporary password
		console.log('Sending welcome email...');
		const emailSent = await sendCorporateAdminWelcomeEmail({
			companyName,
			companyEmail,
			contactPersonName: `${firstName} ${lastName}`.trim(),
			tempPassword
		});

		if (!emailSent) {
			console.warn('Failed to send welcome email to corporate admin');
		} else {
			console.log('Welcome email sent successfully');
		}

		res.status(201).json({
			success: true,
			message: 'Corporate admin added successfully',
			data: {
				userId: user._id,
				email: companyEmail,
				companyName,
				corporateId: corporate._id
			}
		});

	} catch (error) {
		console.error('Error adding corporate admin:', error);
		res.status(500).json({
			success: false,
			message: `Internal server error: ${error.message}`
		});
	}
};

// Helper function to generate secure password
const generateSecurePassword = () => {
	const length = 12;
	const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
	let password = '';
	
	for (let i = 0; i < length; i++) {
		password += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	
	return password;
};


