import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (email: string, token: string) => {
	const resetLink = `http://localhost:4000/reset-password?token=${token}`;

	await resend.emails.send({
		from: 'Auth App <onboarding@resend.dev>',
		to: email,
		subject: 'Password Reset Request',
		html: `
			<h2>Password Reset</h2>
			<p>You requested to reset your password.</p>
			<p>Click the link below:</p>
			<a href="${resetLink}">${resetLink}</a>
		`,
	});
};