package com.secauth.controller;

import com.secauth.model.User;
import com.secauth.payload.request.LoginRequest;
import com.secauth.payload.request.SignupRequest;
import com.secauth.payload.response.JwtResponse;
import com.secauth.payload.response.MessageResponse;
import com.secauth.repository.UserRepository;
import com.secauth.security.JwtUtils;
import com.secauth.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import com.secauth.payload.request.VerifyOtpRequest;
import com.secauth.payload.request.ForgotPasswordRequest;
import com.secauth.payload.request.ResetPasswordRequest;
import com.secauth.service.EmailService;
import org.springframework.security.authentication.DisabledException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new JwtResponse(jwt, 
                                                     userDetails.getId(), 
                                                     userDetails.getUsername(), 
                                                     userDetails.getEmail(), 
                                                     roles));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Account is not verified. Please verify your email via OTP."));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid credentials."));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(), 
                             signUpRequest.getEmail(),
                             encoder.encode(signUpRequest.getPassword()));
        
        // Generate OTP
        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        user.setVerified(false);

        userRepository.save(user);

        // Try to send email
        try {
            emailService.sendVerificationEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + user.getEmail() + " : " + e.getMessage());
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please check your email for the OTP."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        if (user.isVerified()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Account is already verified."));
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid OTP!"));
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: OTP has expired!"));
        }

        // Verify user
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        try {
            emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
        } catch (Exception e) {
            System.err.println("Failed to send welcome email to " + user.getEmail() + " : " + e.getMessage());
            // We don't fail the verification if the welcome email fails
        }

        return ResponseEntity.ok(new MessageResponse("Account verified successfully! You can now log in."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + user.getEmail() + " : " + e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to send OTP email."));
        }

        return ResponseEntity.ok(new MessageResponse("OTP sent to your email for password reset."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@Valid @RequestBody com.secauth.payload.request.ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + user.getEmail() + " : " + e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to resend OTP email."));
        }

        return ResponseEntity.ok(new MessageResponse("A new OTP has been sent to your email."));
    }

    @PostMapping("/update-unverified-email")
    public ResponseEntity<?> updateUnverifiedEmail(@Valid @RequestBody com.secauth.payload.request.UpdateEmailRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        // Extremely important security check: Verify the password matches
        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid password. Security verification failed."));
        }

        // Cannot change email if already verified
        if (user.isVerified()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Account is already verified."));
        }

        // Check if new email is taken by someone else
        if (!user.getEmail().equals(request.getNewEmail()) && userRepository.existsByEmail(request.getNewEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        user.setEmail(request.getNewEmail());
        
        String otp = emailService.generateOTP();
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + user.getEmail() + " : " + e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to send OTP to new email."));
        }

        return ResponseEntity.ok(new MessageResponse("Email updated successfully. A new OTP has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid OTP!"));
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: OTP has expired!"));
        }

        // Reset password
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        
        // Also verify them if they were unverified
        if (!user.isVerified()) {
            user.setVerified(true);
        }
        
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now log in."));
    }
}
