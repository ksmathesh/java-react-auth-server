package com.secauth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendVerificationEmail(String toEmail, String otp) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Your Security Verification Code");
        
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>"
                + "<h2 style='color: #4CAF50; text-align: center;'>Security Authentication</h2>"
                + "<p>Hello,</p>"
                + "<p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your account. This code is valid for 10 minutes.</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<span style='font-size: 32px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;'>" + otp + "</span>"
                + "</div>"
                + "<p>If you did not request this code, please ignore this email.</p>"
                + "<p>Best regards,<br>The SecAuth Team</p>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendWelcomeEmail(String toEmail, String username) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject("Welcome to SecAuth! 🎉");
        
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #fcefd6;'>"
                + "<div style='background-color: #ffffff; padding: 30px; border-radius: 8px;'>"
                + "<h2 style='color: #ef4444; text-align: center;'>Account Verified Successfully!</h2>"
                + "<p style='font-size: 16px; color: #1f2937;'>Hi <strong>" + username + "</strong>,</p>"
                + "<p style='font-size: 16px; color: #1f2937;'>Welcome to the family! Your email has been successfully verified, and your account is now fully active.</p>"
                + "<p style='font-size: 16px; color: #1f2937;'>You can now log in and explore all the secure features we have to offer.</p>"
                + "<div style='text-align: center; margin: 30px 0;'>"
                + "<a href='http://localhost:5173/login' style='background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;'>Go to Dashboard</a>"
                + "</div>"
                + "<p style='font-size: 14px; color: #6b7280;'>If you have any questions, feel free to reply to this email.</p>"
                + "<p style='font-size: 16px; color: #1f2937;'>Best regards,<br><strong>The SecAuth Team</strong></p>"
                + "</div>"
                + "</div>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
