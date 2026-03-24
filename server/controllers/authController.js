import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { EmployeeProfile } from '../models/EmployeeProfile.js';
import { Workflow } from '../models/Workflow.js';
import { Invite } from '../models/Invite.js';

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

async function provisionEmployeeOnboarding(user) {
  const profile = await EmployeeProfile.create({ userId: user._id, status: 'onboarding' });
  await Workflow.create({
    employeeId: profile._id,
    currentStep: 'SUBMITTED',
    history: [{ step: 'SUBMITTED', action: 'registration', at: new Date() }],
  });
  return profile;
}

/**
 * Register a new user. Employee role creates profile + initial workflow (SUBMITTED).
 */
export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    /** Public registration is employee-only; HR/Admin accounts are created via seed or DB. */
    const role = 'employee';
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    let profile = null;
    if (role === 'employee') {
      profile = await provisionEmployeeOnboarding(user);
    }

    const token = signToken(user._id);
    const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role };

    return res.status(201).json({
      token,
      user: safeUser,
      employeeProfileId: profile?._id || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Signup failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    let employeeProfileId = null;
    if (user.role === 'employee') {
      const ep = await EmployeeProfile.findOne({ userId: user._id });
      employeeProfileId = ep?._id || null;
    }

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      employeeProfileId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function signupWithInvite(req, res) {
  try {
    const { name, email, password, token } = req.body;
    if (!name || !email || !password || !token) {
      return res.status(400).json({ message: 'Name, email, password, and token are required' });
    }

    const invite = await Invite.findOne({ token });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    if (invite.isUsed) {
      return res.status(400).json({ message: 'Invite has already been used' });
    }
    if (invite.expiresAt.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Invite has expired' });
    }

    const normalizedEmail = email.toLowerCase();
    if (invite.email !== normalizedEmail) {
      return res.status(400).json({ message: 'Invite email does not match' });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: invite.role,
    });

    let profile = null;
    if (user.role === 'employee') {
      profile = await provisionEmployeeOnboarding(user);
    }

    invite.isUsed = true;
    await invite.save();

    const signedToken = signToken(user._id);
    return res.status(201).json({
      token: signedToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      employeeProfileId: profile?._id || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Signup with invite failed' });
  }
}

export async function me(req, res) {
  try {
    const user = req.user;
    let employeeProfileId = null;
    if (user.role === 'employee') {
      const ep = await EmployeeProfile.findOne({ userId: user._id });
      employeeProfileId = ep?._id || null;
    }
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      employeeProfileId,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
