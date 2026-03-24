import crypto from 'crypto';
import { Invite } from '../models/Invite.js';

const allowedRoles = new Set(['employee', 'hr', 'manager']);

function buildInviteLink(token) {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  return `${clientUrl}/signup?token=${token}`;
}

function hasInviteExpired(invite) {
  return invite.expiresAt.getTime() <= Date.now();
}

export async function createInvite(req, res) {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }
    if (!allowedRoles.has(role)) {
      return res.status(400).json({ message: 'Role must be employee, hr, or manager' });
    }

    const normalizedEmail = email.toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const invite = await Invite.create({
      email: normalizedEmail,
      role,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const inviteLink = buildInviteLink(invite.token);
    console.log(`Invite created for ${invite.email}: ${inviteLink}`);

    return res.status(201).json({
      message: 'Invite created successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      inviteLink,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Could not create invite' });
  }
}

export async function getInviteByToken(req, res) {
  try {
    const invite = await Invite.findOne({ token: req.params.token });
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    if (invite.isUsed) {
      return res.status(400).json({ message: 'Invite has already been used' });
    }
    if (hasInviteExpired(invite)) {
      return res.status(400).json({ message: 'Invite has expired' });
    }

    return res.json({
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Could not validate invite' });
  }
}
