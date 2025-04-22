// some basic constants here  
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConstantConfig {
  // Category-related constants
  readonly category = {
    notFound: `Category not found.`,
    creationFailed: 'Failed to create category.',
    updateFailed: 'Failed to update category.',
    deletionFailed: 'Failed to delete category.',
    exist: 'Category already exists.',
    delete: 'Category removed successfully!',
  };

  generalMessages = {
    auth: {
      userCreated: 'User Created Successfully.',
      resetTokenSent: 'Reset password token sent to email.',
      PWDReset: 'PWD successfully reset.',
      PWDChanged: 'PWD successfully changed.',
      userLogin: 'User Login Successfully.',
      yourResetToken: 'Your password reset token is:',
      emailSendSuccess: 'Email sent successfully.',
      sendOtp: 'OTP was sent to registered email',
    },

    user: {
      signUp: 'Please check your email for the verification code.',
      confirmEmail: 'User email confirmed successfully!',
      signedIn: 'User signed in successfully!',
      updatePassword: 'Password updated successfully!',
      resetPasswordProcess: 'Password reset process initiated successfully! Please check your email for further instructions.',
      confirmationCode: 'Confirmation code resent successfully!',
      resetPassword: 'Password has been reset successfully!',
      refreshToken: 'Token refreshed successfully!',
      logout: 'User logged out successfully!',
      inCorrectOldPassword: 'Incorrect old password.',
    },
    analysis: {
      analysisCreated: 'Analysis created successfully.',
      analysisUpdated: 'Analysis updated successfully.',
    },
    device: {
      deviceDetailStored: 'device details successfully stored.',
      destroyed: 'device destroyed.',
      updateUserDevice: 'update user device.',
    },
  };

  error = {
   
    auth: {
      alreadyExist: 'User already exists.',
      alreadyVerified: 'Already verified.',
      emailExists: 'User with this email already exists.',
      emailTaken: 'Email has already been taken.',
      userNotFound: 'User not found.',
      invalidEmail: 'Invalid email.',
      loginFailed: 'Login failed.',
      findByIdError: 'Error finding user by ID :',
      updateProfileError: 'You can only update your own profile',
      updateUserError: 'Failed to update user',
      PWDMismatch: 'PWD do not match',
      invalidToken: 'Invalid Token.',
      tokenMissing: 'Token missing.',
      invalidTokenType: 'Invalid token type.',
      authHeaderMissing: 'Authorization header missing.',
      invalidEmailPassword: 'Email or password is invalid.',
      incorrectCurrentPassword: 'Current password is incorrect.',
      customerIdError: 'Error getting user ID by customer ID:',
      createUserError: 'Failed to create user.',
      invalidRefreshToken: 'Invalid refresh token',
      expiredRefreshToken: 'Invalid or expired refresh token.',
      sendEmailError: 'Error while sending email.',
      noAuthToken: 'No authorization token provided.',
      idRequired: 'ID is required!',
      PathRequired: 'Bad Request: Path is required.',
      nothingToUpdate: 'At least one field is required to update.',
      invalidHeader: 'Authorization header must be provided.',
      idTokenRequired: 'ID token is required.',
      InvalidIDToken: 'Invalid ID token.',
      InvalidGoogleCred: 'Failed to obtain Google credentials.',
      RefreshTokenRequired: 'Refresh token is required and must be a valid string.',
      AccessTokenNotFound: 'Access token not found in the request headers.',
      sendOtp: 'Failed to send OTP email.',
      invalidData: 'Invalid input data.',
      refreshTokenRequired: 'Refresh token is required.',
      invalidAuthHeader: 'Invalid authorization header.',
      emailNotInToken: 'Email not present in token.',
      emailNotFoundSocialLogin: 'Email not found for Social login.',
      phoneExists: 'Phone number already exists for another user.',
      notAuthenticated: 'User is not authenticated.',
    },

  };

  success = {
    PasswordSuccess: 'Password changed successfully.',
    verifyCode: 'Verification code sent to the user email.',
    resetPassword: 'Password reset successfully.',
    verifySuccess: 'User verified successfully.',
    SignedOut: 'User signed out successfully.',
    LoggedInSuccess: 'User logged in successfully.',
    OrderSuccess: 'Order created successfully.',
    OrderCancel: 'Order cancelled successfully.',
    ReOrderAdded: 'Reorder items added successfully',
    InvoiceCreated: 'Invoice created successfully',
    attachmentCreated: 'Attachment added successfully.',
    visitCreated: 'Attachment added successfully.',
  };
}

export const formatMessage = (message: string, params: Record<string, any>) => {
  return message.replace(/\{(\w+)\}/g, (_, key) => params[key]?.toString() || '');
};
